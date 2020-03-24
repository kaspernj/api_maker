import * as stackTraceParser from "stacktrace-parser"
import {SourceMapConsumer} from "source-map"

export default class SourceMapsLoader {
  constructor() {
    this.sourceMaps = []
    this.srcLoaded = {}
  }

  loadSourceMapsForScriptTags(callback) {
    this.loadSourceMapsForScriptTagsCallback = callback
  }

  async loadSourceMaps() {
    const scripts = document.querySelectorAll("script")
    const promises = []

    for(const script of scripts) {
      const src = this.loadSourceMapsForScriptTagsCallback(script)

      console.log(`SCRIPT SRC FOUND: ${src}`)

      if (src && !this.srcLoaded[src]) {
        this.srcLoaded[src] = true

        const promise = this.loadSourceMapForSource(src)
        promises.push(promise)
      }
    }

    await Promise.all(promises)
  }

  async loadSourceMapForSource(src) {
    const url = this.loadUrl(src)
    const originalUrl = `${url.origin}${url.pathname}`
    const mapUrl = `${url.origin}${url.pathname}.map`
    const xhr = new XMLHttpRequest()

    xhr.open("GET", mapUrl, true)
    await this.loadXhr(xhr)

    console.log(`LOADING SOURCE MAP: ${mapUrl}`)

    const consumer = new SourceMapConsumer(JSON.parse(xhr.responseText))
    this.sourceMaps.push({consumer, originalUrl, src})
  }

  loadUrl(url) {
    const parser = document.createElement("a")
    parser.href = url

    return parser
  }

  loadXhr(xhr, postData) {
    return new Promise((resolve) => {
      xhr.onload = () => resolve()
      xhr.send(postData)
    })
  }

  parseStackTrace(stackTrace) {
    return this.getStackTraceData(stackTrace)
      .map((traceData) => `at ${traceData.methodName} (${traceData.fileString})`)
  }

  getStackTraceData(stackTrace) {
    const stack = stackTraceParser.parse(stackTrace)
    const newSourceMap = []

    for(const trace of stack) {
      const sourceMapData = this.sourceMaps.find((sourceMapData) => {
        console.log({ sourceMapData, trace })
        return sourceMapData.originalUrl == trace.file
      })
      let filePath, fileString, original

      if (sourceMapData) {
        console.log("HAS SOURCE MAP DATA")

        const sourceMapConsumer = sourceMapData.consumer
        original = sourceMapConsumer.originalPositionFor({
          line: trace.lineNumber,
          column: trace.column
        })
      } else {
        console.log("HASNT SOURCE MAP DATA")
      }

      if (original && original.source) {
        filePath = original.source.replace(/^webpack:\/\/\//, "")
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

      console.log({ filePath, fileString, trace })

      newSourceMap.push({
        filePath,
        fileString,
        methodName: trace.methodName
      })
    }

    return newSourceMap
  }
}
