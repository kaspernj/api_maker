const shared = {}

/** Small logger with global and per-instance debug toggles. */
export default class ApiMakerLogger {
  /** @returns {boolean | undefined} */
  static getGlobalDebug = () => shared.isDebugging

  /**
   * @param {boolean} newValue
   * @returns {void}
   */
  static setGlobalDebug(newValue) {
    shared.isDebugging = newValue
  }

  /** @param {{name?: string}} [args] */
  constructor(args = {}) {
    this.name = args.name
  }

  /**
   * @param {string | (() => string | Array<any>) | Array<any>} message
   * @returns {void}
   */
  debug(message) {
    if (this.getDebug()) {
      this.log(message)
    }
  }

  /**
   * @param {any} message
   * @returns {void}
   */
  error(message) {
    console.error(message)
  }

  /**
   * @param {string | (() => string | Array<any>) | Array<any>} message
   * @returns {void}
   */
  log(message) {
    if (!this.debug && !ApiMakerLogger.getGlobalDebug()) return
    let logMessage = message

    if (typeof logMessage == "function") logMessage = logMessage()
    if (!Array.isArray(logMessage)) logMessage = [logMessage]
    if (this.name) logMessage = [`${this.name}:`, ...logMessage]

    console.log(...logMessage)
  }

  /** @returns {boolean | undefined} */
  getDebug = () => this.isDebugging

  /**
   * @param {boolean} value
   * @returns {void}
   */
  setDebug(value) {
    this.isDebugging = value
  }
}
