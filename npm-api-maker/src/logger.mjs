const shared = {}

export default class ApiMakerLogger {
  static current() {
    if (!shared.apiMakerLogger) {
      shared.apiMakerLogger = new ApiMakerLogger()
      // shared.apiMakerLogger.setDebug(true)
    }

    return shared.apiMakerLogger
  }

  static log(message) {
    ApiMakerLogger.current().log(message)
  }

  log(message) {
    if (this.debug)
      console.log("ApiMaker", message)
  }

  getDebug() {
    return this.debug
  }

  setDebug(value) {
    this.debug = value
  }
}
