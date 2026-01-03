import SourceMapsLoader from "./source-maps-loader.js"
import {digg} from "diggerize"

export default class ErrorLogger {
  constructor () {
    this.debugging = false
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

  debug(...output) {
    if (this.debugging) console.error("ApiMaker ErrorLogger:", ...output)
  }

  enable () {
    this.debug("Enable called")
    this.connectOnError()
    this.connectUnhandledRejection()
  }

  getErrors = () => this.errors
  hasErrorOccurred = () => digg(this, "errorOccurred")
  isLoadingSourceMaps = () => digg(this, "sourceMapsLoader", "isLoadingSourceMaps")
  isWorkingOnError = () => digg(this, "isHandlingError") || this.isLoadingSourceMaps()

  connectOnError() {
    window.addEventListener("error", (event) => {
      if (this.debugging) this.debug("Error:", event.message)
      this.errorOccurred = true

      if (!this.isHandlingError) {
        this.isHandlingError = true
        this.onError(event).finally(() => {
          this.isHandlingError = false
        })
      }
    })
  }

  connectUnhandledRejection() {
    window.addEventListener("unhandledrejection", (event) => {
      if (this.debugging) this.debug("Unhandled rejection:", event.reason.message)
      this.errorOccurred = true

      if (!this.isHandlingError) {
        this.isHandlingError = true
        this.onUnhandledRejection(event).finally(() => {
          this.isHandlingError = false
        })
      }
    })
  }

  async onError(event) {
    this.errorOccurred = true

    if (event.error) await this.sourceMapsLoader.loadSourceMaps(event.error)

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

  async onUnhandledRejection(event) {
    if (event.reason) await this.sourceMapsLoader.loadSourceMaps(event.reason)

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

  testPromiseError() {
    return new Promise((_resolve) => {
      throw new Error("testPromiseError")
    })
  }
}
