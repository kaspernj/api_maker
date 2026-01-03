const shared = {}

export default class ApiMakerLogger {
  static getGlobalDebug = () => shared.isDebugging

  static setGlobalDebug(newValue) {
    shared.isDebugging = newValue
  }

  constructor(args = {}) {
    this.name = args.name
  }

  debug(message) {
    if (this.getDebug()) {
      this.log(message)
    }
  }

  error(message) {
    console.error(message)
  }

  log(message) {
    if (!this.debug && !ApiMakerLogger.getGlobalDebug()) return
    let logMessage = message

    if (typeof logMessage == "function") logMessage = logMessage()
    if (!Array.isArray(logMessage)) logMessage = [logMessage]
    if (this.name) logMessage = [`${this.name}:`, ...logMessage]

    console.log(...logMessage)
  }

  getDebug = () => this.isDebugging

  setDebug(value) {
    this.isDebugging = value
  }
}
