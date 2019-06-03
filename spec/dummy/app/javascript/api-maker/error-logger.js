import retrace from "retrace"

export default class ErrorLogger {
  constructor() {
    this.errors = []
  }

  loadSourceMaps() {
    return new Promise(resolve => {
      var scripts = document.querySelectorAll("script")
      var promises = []

      for(var script of scripts) {
        var src = script.getAttribute("src")
        var type = script.getAttribute("type")

        if (src && src.includes("/packs/") && (type == "text/javascript" || !type)) {
          var promise = this.loadSourceMapForScript(script)
          promises.push(promise)
        }
      }

      Promise.all(promises).then(() => { resolve() })
    })
  }

  loadSourceMapForScript(script) {
    var src = script.getAttribute("src")
    var url = this.loadUrl(src)
    var originalUrl = `${url.origin}${url.pathname}`
    var mapUrl = `${url.origin}${url.pathname}.map`

    return new Promise(resolve => {
      var xhr = new XMLHttpRequest()
      xhr.open("GET", mapUrl, true)
      xhr.onload = () => {
        retrace.register(originalUrl, xhr.responseText)
        resolve()
      }
      xhr.send()
    })
  }

  loadUrl(url) {
    var parser = document.createElement("a")
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
