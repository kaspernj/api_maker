import * as stackTraceParser from "stacktrace-parser"
import Logger from "./logger.mjs"
import {SourceMapConsumer} from "source-map"
import uniqunize from "uniqunize"

// Sometimes this needs to be called and sometimes not
if (SourceMapConsumer.initialize) {
  SourceMapConsumer.initialize({
    "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.3/lib/mappings.wasm"
  })
}

const logger = new Logger({name: "ApiMaker / SourceMapsLoader"})

export default class SourceMapsLoader {
  constructor () {
    this.isLoadingSourceMaps = false
    this.sourceMaps = []
    this.srcLoaded = {}
  }

  loadSourceMapsForScriptTags (callback) {
    this.loadSourceMapsForScriptTagsCallback = callback
  }

  sourceMapForSource (callback) {
    this.sourceMapForSourceCallback = callback
  }

  async loadSourceMaps (error) {
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

  getSources(error) {
    let sources = this.getSourcesFromScripts()

    if (error) sources = sources.concat(this.getSourcesFromError(error))

    return uniqunize(sources, (source) => source.originalUrl)
  }

  getSourcesFromError(error) {
    const stack = stackTraceParser.parse(error.stack)
    const sources = []

    for (const trace of stack) {
      const file = trace.file

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

  getSourcesFromScripts() {
    const scripts = document.querySelectorAll("script")
    const sources = []

    for (const script of scripts) {
      const sourceMapUrl = this.getMapURL({script, src: script.src})

      if (sourceMapUrl) {
        logger.debug(() => `Found source map from script: ${sourceMapUrl}`)
        sources.push({originalUrl: script.src, sourceMapUrl})
      }
    }

    return sources
  }

  getMapURL({script, src}) {
    const url = this.loadUrl(src)
    const originalUrl = `${url.origin}${url.pathname}`

    if (this.sourceMapForSourceCallback) {
      // Use custom callback to resolve which map-file to download
      return this.sourceMapForSourceCallback({originalUrl, script, src, url})
    } else if (this.includeMapURL(src)) {
      // Default to original URL with '.map' appended
      return `${originalUrl}.map`
    }
  }

  includeMapURL(src) {
    return src.includes("/packs/")
  }

  async loadSourceMapForSource ({originalUrl, sourceMapUrl}) {
    const xhr = new XMLHttpRequest()

    xhr.open("GET", sourceMapUrl, true)

    await this.loadXhr(xhr)

    const consumer = await new SourceMapConsumer(xhr.responseText)

    this.sourceMaps.push({consumer, originalUrl})
  }

  loadUrl (url) {
    const parser = document.createElement("a")
    parser.href = url

    return parser
  }

  loadXhr (xhr, postData) {
    return new Promise((resolve) => {
      xhr.onload = () => resolve()
      xhr.send(postData)
    })
  }

  parseStackTrace (stackTrace) {
    return this.getStackTraceData(stackTrace)
      .map((traceData) => `at ${traceData.methodName} (${traceData.fileString})`)
  }

  getStackTraceData (stackTrace) {
    const stack = stackTraceParser.parse(stackTrace)
    const newSourceMap = []

    for (const trace of stack) {
      const sourceMapData = this.sourceMaps.find((sourceMapData) => sourceMapData.originalUrl == trace.file)

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
        filePath = trace.file
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
