import retrace from "retrace"

export default class ErrorLogger {
  constructor() {
    this.errors = []
  }

  loadSourceMaps() {
    return new Promise(resolve => {
      const scripts = document.querySelectorAll("script")
      const promises = []

      for(const script of scripts) {
        const src = script.getAttribute("src")
        const type = script.getAttribute("type")

        if (src && src.includes("/packs/") && (type == "text/javascript" || !type)) {
          const promise = this.loadSourceMapForScript(script)
          promises.push(promise)
        }
      }

      Promise.all(promises).then(() => { resolve() })
    })
  }

  loadSourceMapForScript(script) {
    const src = script.getAttribute("src")
    const url = this.loadUrl(src)
    const originalUrl = `${url.origin}${url.pathname}`
    const mapUrl = `${url.origin}${url.pathname}.map`

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
        try {
          this.isHandlingError = true
          this.errors.push({
            errorClass: event.error ? event.error.name : "No error class",
            file: event.filename,
            message: event.message || "Unknown error",
            url: window.location.href,
            line: event.lineno,
            error: event.error
          })
        } finally {
          this.isHandlingError = false
        }
      }
    })
  }

  connectUnhandledRejection() {
    window.addEventListener("unhandledrejection", (event, test) => {
      if (!this.isHandlingError) {
        this.isHandlingError = true

        try {
          if (event.reason.stack) {
            retrace.map(event.reason.stack).then(mappedStackTrace => {
              this.errors.push({
                errorClass: "UnhandledRejection",
                file: null,
                message: event.reason.message || "Unhandled promise rejection",
                url: window.location.href,
                line: null,
                backtrace: mappedStackTrace.split("\n")
              })
            })
          } else {
            this.errors.push({
              errorClass: "UnhandledRejection",
              file: null,
              message: event.reason.message || "Unhandled promise rejection",
              url: window.location.href,
              line: null,
              backtrace: null
            })
          }
        } finally {
          this.isHandlingError = false
        }
      }
    })
  }

  testPromiseError() {
    return new Promise(resolve => {
      throw new Error("testPromiseError")
    })
  }
}
