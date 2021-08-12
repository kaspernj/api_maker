module.exports = class ApiMakerLogger {
  static current() {
    if (!global.apiMakerLogger) {
      global.apiMakerLogger = new ApiMakerLogger()
      // global.apiMakerLogger.setDebug(true)
    }

    return global.apiMakerLogger
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
