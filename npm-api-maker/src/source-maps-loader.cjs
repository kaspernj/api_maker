const stackTraceParser = require("stacktrace-parser")
const {SourceMapConsumer} = require("source-map")
const uniqunize = require("uniqunize")

// Sometimes this needs to be called and sometimes not
if (SourceMapConsumer.initialize) {
  SourceMapConsumer.initialize({
    "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.3/lib/mappings.wasm"
  })
}

module.exports = class SourceMapsLoader {
  constructor () {
    this.debug = false
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

  getSources(error) {
    let sources = this.getSourcesFromScripts()

    if (error) sources = sources.concat(this.getSourcesFromError(error))

    return uniqunize(sources)
  }

  async loadSourceMaps (error) {
    this.isLoadingSourceMaps = true

    try {
      const promises = []
      const sources = this.getSources(error)

      for(const src of sources) {
        if (src && !this.srcLoaded[src]) {
          this.srcLoaded[src] = true

          const promise = this.loadSourceMapForSource(src)
          promises.push(promise)
        }
      }

      await Promise.all(promises)
    } finally {
      this.isLoadingSourceMaps = false
    }
  }

  getSourcesFromError(error) {
    const stack = stackTraceParser.parse(error.stack)
    const sources = []

    for (const trace of stack) {
      sources.push(trace.file)
    }

    return sources
  }

  getSourcesFromScripts() {
    const scripts = document.querySelectorAll("script")
    const sources = []

    for (const script of scripts) {
      const src = this.loadSourceMapsForScriptTagsCallback(script)

      if (src) {
        this.srcLoaded[src] = true
        sources.push(src)
      }
    }

    return sources
  }

  async loadSourceMapForSource (src) {
    const url = this.loadUrl(src)
    const originalUrl = `${url.origin}${url.pathname}`

    let mapUrl

    if (this.sourceMapForSourceCallback) {
      // Use custom callback to resolve which map-file to download
      mapUrl = this.sourceMapForSourceCallback({src, url})
    } else {
      // Default to original URL with '.map' appended
      mapUrl = `${originalUrl}.map`
    }

    const xhr = new XMLHttpRequest()

    xhr.open("GET", mapUrl, true)

    await this.loadXhr(xhr)

    const consumer = await new SourceMapConsumer(xhr.responseText)

    this.sourceMaps.push({consumer, originalUrl, src})
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
