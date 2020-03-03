import retrace from "retrace"

export default class ErrorLogger {
  constructor() {
    this.errors = []
    this.loadedSourceMaps = {}
  }

  loadSourceMaps() {
    return new Promise(resolve => {
      const scripts = document.querySelectorAll("script")
      const promises = []

      for(const script of scripts) {
        const src = script.getAttribute("src")
        const type = script.getAttribute("type")

        if (src && src.includes("/packs/") && !this.loadedSourceMaps[src] && (type == "text/javascript" || !type)) {
          const promise = this.loadSourceMapForSource(src)
          promises.push(promise)
        }
      }

      Promise.all(promises).then(() => resolve())
    })
  }

  loadSourceMapForSource(src) {
    const url = this.loadUrl(src)
    const originalUrl = `${url.origin}${url.pathname}`
    const mapUrl = `${url.origin}${url.pathname}.map`
    this.loadedSourceMaps[src] = true

    return new Promise(resolve => {
      const xhr = new XMLHttpRequest()
      xhr.open("GET", mapUrl, true)
      xhr.onload = () => {
        retrace.register(originalUrl, xhr.responseText)
        resolve()
      }
      xhr.send()
    })
  }

  loadUrl(url) {
    const parser = document.createElement("a")
    parser.href = url

    return parser
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
    await this.loadSourceMaps()

    let stackTrace

    if (event.error && event.error.stack) {
      stackTrace = await retrace.map(event.error.stack)
    }

    this.errors.push({
      errorClass: event.error ? event.error.name : "No error class",
      file: event.filename,
      message: event.message || "Unknown error",
      url: window.location.href,
      line: event.lineno,
      error: event.error,
      backtrace: stackTrace
    })
  }

  async onUnhandledRejection(event) {
    await this.loadSourceMaps()

    let stackTrace

    if (event.reason.stack) {
      stackTrace = await retrace.map(event.reason.stack)
    }

    this.errors.push({
      errorClass: "UnhandledRejection",
      file: null,
      message: event.reason.message || "Unhandled promise rejection",
      url: window.location.href,
      line: null,
      backtrace: stackTrace && stackTrace.split("\n")
    })
  }

  testPromiseError() {
    return new Promise(resolve => {
      throw new Error("testPromiseError")
    })
  }
}
