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
    if (typeof message == "function") message = message()
    if (!Array.isArray(message)) message = [message]
    if (this.name) message.unshift(`${this.name}:`)

    console.log(...message)
  }

  getDebug = () => this.isDebugging

  setDebug(value) {
    this.isDebugging = value
  }
}
