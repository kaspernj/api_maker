import {digg} from "diggerize"
import SourceMapsLoader from "./source-maps-loader.mjs"

export default class ErrorLogger {
  constructor () {
    this.debug = true
    this.errorOccurred = false
    this.errors = []
    this.isHandlingError = false
    this.sourceMapsLoader = new SourceMapsLoader()
    this.sourceMapsLoader.loadSourceMapsForScriptTags((script) => {
      const src = script.getAttribute("src")
      const type = script.getAttribute("type")

      if (src && (src.includes("/packs/") || src.includes("/packs-test/")) && (type == "text/javascript" || !type)) {
        return src
      }
    })
  }

  enable () {
    this.connectOnError()
    this.connectUnhandledRejection()
  }

  getErrors () {
    return this.errors
  }

  hasErrorOccurred() {
    return digg(this, "errorOccurred")
  }

  isLoadingSourceMaps() {
    return digg(this, "sourceMapsLoader", "isLoadingSourceMaps")
  }

  isWorkingOnError() {
    return digg(this, "isHandlingError") || this.isLoadingSourceMaps()
  }

  connectOnError () {
    globalThis.addEventListener("error", (event) => {
      this.errorOccurred = true

      if (!this.isHandlingError) {
        this.isHandlingError = true
        this.onError(event).finally(() => {
          this.isHandlingError = false
        })
      }
    })
  }

  connectUnhandledRejection () {
    globalThis.addEventListener("unhandledrejection", (event) => {
      this.errorOccurred = true

      if (!this.isHandlingError) {
        this.isHandlingError = true
        this.onUnhandledRejection(event).finally(() => {
          this.isHandlingError = false
        })
      }
    })
  }

  async onError (event) {
    this.errorOccurred = true
    await this.sourceMapsLoader.loadSourceMaps(event.error)

    if (event.error && event.error.stack) {
      const backtrace = this.sourceMapsLoader.parseStackTrace(event.error.stack)

      this.errors.push({
        errorClass: event.error ? event.error.name : "No error class",
        message: event.message || "Unknown error",
        backtrace
      })
    } else {
      this.errors.push({
        errorClass: event.error ? event.error.name : "No error class",
        message: event.message || "Unknown error",
        backtrace: null
      })
    }
  }

  async onUnhandledRejection (event) {
    await this.sourceMapsLoader.loadSourceMaps(event.reason)

    if (event.reason.stack) {
      const backtrace = this.sourceMapsLoader.parseStackTrace(event.reason.stack)

      this.errors.push({
        errorClass: "UnhandledRejection",
        message: event.reason.message || "Unhandled promise rejection",
        backtrace
      })
    } else {
      this.errors.push({
        errorClass: "UnhandledRejection",
        message: event.reason.message || "Unhandled promise rejection",
        backtrace: null
      })
    }
  }

  testPromiseError () {
    return new Promise((_resolve) => {
      throw new Error("testPromiseError")
    })
  }
}
