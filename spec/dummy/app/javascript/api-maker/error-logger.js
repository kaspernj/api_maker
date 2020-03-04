import SourceMapsLoader from "api-maker/source-maps-loader"

export default class ErrorLogger {
  constructor() {
    this.errors = []
    this.sourceMapsLoader = new SourceMapsLoader()
    this.sourceMapsLoader.loadSourceMapsForScriptTags((script) => {
      const src = script.getAttribute("src")
      const type = script.getAttribute("type")

      if (src && src.includes("/packs/") && (type == "text/javascript" || !type)) {
        return src
      }
    })
  }

  enable() {
    this.connectOnError()
    this.connectUnhandledRejection()
  }

  getErrors() {
    return this.errors
  }

  connectOnError() {
    window.addEventListener("error", (event) => {
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
      if (!this.isHandlingError) {
        this.isHandlingError = true
        this.onUnhandledRejection(event).finally(() => {
          this.isHandlingError = false
        })
      }
    })
  }

  async onError(event) {
    await this.sourceMapsLoader.loadSourceMaps()

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
    await this.sourceMapsLoader.loadSourceMaps()

    if (event.reason.stack) {
      const backtrace = this.sourceMapsLoader.parseStackTrace(event.reason.stack)

      this.errors.push({
        errorClass: "UnhandledRejection",
        message: event.reason.message || "Unhandled promise rejection",
        backtrace: backtrace
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
    return new Promise(resolve => {
      throw new Error("testPromiseError")
    })
  }
}
