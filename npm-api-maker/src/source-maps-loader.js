// @ts-check
import Logger from "./logger.js"
import {SourceMapConsumer} from "source-map"
import uniqunize from "uniqunize"

/** @typedef {{originalUrl: string, sourceMapUrl: string}} SourceMapTarget */
/** @typedef {{consumer: SourceMapConsumer, originalUrl: string}} LoadedSourceMap */
/** @typedef {(script: HTMLScriptElement) => string | undefined} ScriptSourceSelector */
/** @typedef {(args: {originalUrl: string, script?: HTMLScriptElement, src: string, url: HTMLAnchorElement}) => string | undefined} SourceMapResolver */
/** @typedef {{script?: HTMLScriptElement, src: string}} MapUrlArgs */
/** @typedef {{filePath: string | null, fileString: string, methodName: string}} ParsedTraceData */
/** @typedef {{methodName: string, file: string, lineNumber: number, column: number | null}} RawStackFrame */

/**
 * Parses one raw stack-trace line into frame data. Handles the V8
 * (`at fn (file:1:2)`), WebKit/Firefox (`fn@file:1:2`), and newer paren
 * (`fn (file:1:2)`) styles, with or without the `at` prefix. Returns `null`
 * for lines that carry no `file:line` location (the error message, location-less
 * native frames, or noise). Unlike a fixed set of regexes, this never drops a
 * line that has a location, so no frame is silently lost to an unrecognized format.
 * @param {string} line
 * @returns {RawStackFrame | null}
 */
const parseStackLine = (line) => {
  const trimmed = line.trim()

  if (!trimmed) return null

  // The trailing location is the last `:LINE` or `:LINE:COL` (optionally inside a
  // closing paren). The file part may itself contain `:` (https:, node:, file:),
  // so the location is anchored to the end of the line.
  let match = trimmed.match(/^(.*):(\d+):(\d+)\)?\s*$/)
  let prefix
  let lineNumber
  let column

  if (match) {
    prefix = match[1]
    lineNumber = Number(match[2])
    column = Number(match[3])
  } else if ((match = trimmed.match(/^(.*):(\d+)\)?\s*$/))) {
    prefix = match[1]
    lineNumber = Number(match[2])
    column = null
  } else {
    return null
  }

  // A leading V8 `at ` is a keyword, not part of the method name or the file.
  const rest = prefix.replace(/^\s*at\s+/, "")

  // The file begins at the last `@` or `(` in the remainder; the method name is
  // whatever precedes it.
  const atIdx = rest.lastIndexOf("@")
  const parenIdx = rest.lastIndexOf("(")
  const splitIdx = Math.max(atIdx, parenIdx)

  let file
  let namePart

  if (splitIdx >= 0) {
    file = rest.slice(splitIdx + 1)
    namePart = rest.slice(0, splitIdx)
  } else {
    const lastSpace = rest.lastIndexOf(" ")

    if (lastSpace >= 0) {
      file = rest.slice(lastSpace + 1)
      namePart = rest.slice(0, lastSpace)
    } else {
      file = rest
      namePart = ""
    }
  }

  const methodName = namePart.replace(/\s*at\s+/, "").trim() || "<unknown>"

  return {methodName, file: file.trim(), lineNumber, column}
}

/**
 * Parses a full stack-trace string into frames, preserving line order and never
 * dropping a line that carries a `file:line` location.
 * @param {string} stack
 * @returns {RawStackFrame[]}
 */
const parseStackLines = (stack) => {
  const frames = []

  for (const line of String(stack ?? "").split("\n")) {
    const frame = parseStackLine(line)

    if (frame) frames.push(frame)
  }

  return frames
}

// Sometimes this needs to be called and sometimes not
// @ts-expect-error
if (SourceMapConsumer.initialize) {
  // @ts-expect-error
  SourceMapConsumer.initialize({
    "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.4/lib/mappings.wasm"
  })
}

const logger = new Logger({name: "ApiMaker / SourceMapsLoader"})

/** Loads and resolves source maps for stack traces. */
export default class SourceMapsLoader {
  /** Initializes source-map caches and loading state for stack-trace resolution. */
  constructor() {
    this.isLoadingSourceMaps = false
    this.sourceMaps = /** @type {LoadedSourceMap[]} */ ([])
    this.srcLoaded = {}
  }

  /**
   * Registers a callback that selects which script tags should have source maps loaded.
   * @param {ScriptSourceSelector} callback
   */
  loadSourceMapsForScriptTags(callback) {
    this.loadSourceMapsForScriptTagsCallback = callback
  }

  /**
   * Registers a callback that resolves the source-map URL for one script source.
   * @param {SourceMapResolver} callback
   */
  sourceMapForSource(callback) {
    this.sourceMapForSourceCallback = callback
  }

  async loadSourceMaps(error) {
    if (!error) throw new Error("No error was given to SourceMapsLoader#loadSourceMaps")

    this.isLoadingSourceMaps = true

    try {
      const promises = []
      const sources = this.getSources(error)

      for(const source of sources) {
        if (source.originalUrl && !this.srcLoaded[source.originalUrl]) {
          this.srcLoaded[source.originalUrl] = true

          const promise = this.loadSourceMapForSource(source)
          promises.push(promise)
        }
      }

      await Promise.all(promises)
    } finally {
      this.isLoadingSourceMaps = false
    }
  }

  /**
   * Collects unique source/script entries that may need source maps for one error.
   * @param {Error | undefined} error
   * @returns {SourceMapTarget[]}
   */
  getSources(error) {
    let sources = this.getSourcesFromScripts()

    if (error) sources = sources.concat(this.getSourcesFromError(error))

    return uniqunize(sources, (source) => source.originalUrl)
  }

  /**
   * @param {Error} error - Error to extract sources from.
   * @returns {Array<{originalUrl: string, sourceMapUrl: string}>} Sources from error stack.
   */
  getSourcesFromError(error) {
    const stack = parseStackLines(error.stack)
    const sources = []

    for (const trace of stack) {
      const file = this.normalizeTraceFile(trace.file)

      if (file != "\u003Canonymous>") {
        const sourceMapUrl = this.getMapURL({src: file})

        if (sourceMapUrl) {
          logger.debug(() => `Found source map from error: ${sourceMapUrl}`)

          sources.push({originalUrl: file, sourceMapUrl})
        } else {
          logger.debug(() => `Coudn't get source map from: ${file}`)
        }
      }
    }

    return sources
  }

  /**
   * Collects source-map candidates from currently loaded script tags.
   * @returns {SourceMapTarget[]}
   */
  getSourcesFromScripts() {
    const scripts = document.querySelectorAll("script")
    const sources = []

    for (const script of Array.from(scripts)) {
      const sourceMapUrl = this.getMapURL({script, src: script.src})

      if (sourceMapUrl) {
        logger.debug(() => `Found source map from script: ${sourceMapUrl}`)
        sources.push({originalUrl: script.src, sourceMapUrl})
      }
    }

    return sources
  }

  /**
   * Resolves the source-map URL for one script source.
   * @param {MapUrlArgs} [args]
   * @returns {string | undefined}
   */
  getMapURL(args = /** @type {MapUrlArgs} */ ({src: ""})) {
    const {script} = args
    const src = this.normalizeTraceFile(args.src)
    const url = this.loadUrl(src)
    const originalUrl = `${url.origin}${url.pathname}`

    if (this.sourceMapForSourceCallback) {
      // Use custom callback to resolve which map-file to download
      return this.sourceMapForSourceCallback({originalUrl, script, src, url})
    } else if (this.includeMapURL(src)) {
      // Default to original URL with '.map' appended
      return `${originalUrl}.map`
    }

    return undefined
  }

  /**
   * Returns true when a script source should use the default `.map` lookup behavior.
   * @param {string} src
   * @returns {boolean}
   */
  includeMapURL = (src) => src.includes("/packs/")

  async loadSourceMapForSource({originalUrl, sourceMapUrl}) {
    const xhr = new XMLHttpRequest()

    xhr.open("GET", sourceMapUrl, true)

    try {
      await this.loadXhr(xhr, sourceMapUrl)
    } catch {
      console.log(`Couldn't load source map from: ${sourceMapUrl}: ${xhr.responseText}`)

      return
    }

    // @ts-expect-error
    const consumer = await new SourceMapConsumer(xhr.responseText)

    if (consumer) {
      this.sourceMaps.push({consumer, originalUrl})
    }
  }

  /**
   * Parses one URL string with an anchor element so its parts can be inspected.
   * @param {string} url
   * @returns {HTMLAnchorElement}
   */
  loadUrl(url) {
    const parser = document.createElement("a")

    parser.href = url

    return parser
  }

  /**
   * Strips stack-frame prefixes from absolute bundle URLs before URL parsing.
   * @param {string} traceFile
   * @returns {string}
   */
  normalizeTraceFile(traceFile) {
    const absoluteUrlMatch = traceFile.match(/((?:https?|file):\/\/.+)$/)

    if (absoluteUrlMatch) {
      return absoluteUrlMatch[1]
    }

    return traceFile
  }

  /**
   * Resolves when one XHR finishes successfully or rejects on HTTP failure.
   * @param {XMLHttpRequest} xhr
   * @param {string} url
   * @returns {Promise<void>}
   */
  loadXhr(xhr, url) {
    return new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status == 200) {
          resolve()
        } else {
          reject(new Error(`HTTP request failed with ${xhr.status} for ${url}`))
        }
      }
      xhr.send()
    })
  }

  /**
   * Formats one raw stack trace into source-mapped display lines.
   * @param {string} stackTrace
   * @returns {string[]}
   */
  parseStackTrace(stackTrace) {
    return this.getStackTraceData(stackTrace)
      .map((traceData) => `at ${traceData.methodName} (${traceData.fileString})`)
  }

  /**
   * @param {string} stackTrace - Raw stack trace string.
   * @returns {ParsedTraceData[]} Parsed trace data.
   */
  getStackTraceData(stackTrace) {
    const stack = parseStackLines(stackTrace)
    const newSourceMap = []

    for (const trace of stack) {
      const traceFile = this.normalizeTraceFile(trace.file)
      const sourceMapData = this.sourceMaps.find((sourceMapData) => sourceMapData.originalUrl == traceFile)

      let filePath, fileString, original

      if (sourceMapData) {
        original = sourceMapData.consumer.originalPositionFor({
          line: trace.lineNumber,
          column: trace.column
        })
      }

      if (original && original.source) {
        filePath = original.source.replace(/^webpack:\/\/(app|)\//, "")
        fileString = `${filePath}:${original.line}`

        if (original.column) {
          fileString += `:${original.column}`
        }
      } else {
        filePath = traceFile
        fileString = `${filePath}:${trace.lineNumber}`

        if (trace.column) {
          fileString += `:${trace.column}`
        }
      }

      newSourceMap.push({
        filePath,
        fileString,
        methodName: trace.methodName
      })
    }

    return newSourceMap
  }
}
