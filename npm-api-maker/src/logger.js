export default class ApiMakerLogger {
  static current() {
    if (!window.apiMakerLogger) {
      window.apiMakerLogger = new ApiMakerLogger()
      // window.apiMakerLogger.setDebug(true)
    }

    return window.apiMakerLogger
  }

  static log(message) {
    ApiMakerLogger.current().log(message)
  }

  log(message) {
    if (this.debug)
      console.log("ApiMaker", message)
  }

  setDebug(value) {
    this.debug = value
  }
}
