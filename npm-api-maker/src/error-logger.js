import SourceMapsLoader from "./source-maps-loader.js"
import {digg} from "diggerize"

/** Captures window errors with source-map support. */
export default class ErrorLogger {
  /** Constructor. */
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

  /** debug. */
  debug(...output) {
    if (this.debugging) console.error("ApiMaker ErrorLogger:", ...output)
  }

  /** enable. */
  enable () {
    this.debug("Enable called")
    this.connectOnError()
    this.connectUnhandledRejection()
  }

  /** getErrors. */
  getErrors = () => this.errors

  /** hasErrorOccurred. */
  hasErrorOccurred = () => digg(this, "errorOccurred")

  /** isLoadingSourceMaps. */
  isLoadingSourceMaps = () => digg(this, "sourceMapsLoader", "isLoadingSourceMaps")

  /** isWorkingOnError. */
  isWorkingOnError = () => digg(this, "isHandlingError") || this.isLoadingSourceMaps()

  /** connectOnError. */
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

  /** connectUnhandledRejection. */
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

  /** testPromiseError. */
  testPromiseError() {
    return new Promise((_resolve) => {
      throw new Error("testPromiseError")
    })
  }
}
