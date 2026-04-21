// @ts-check
const shared = {}

/** @typedef {string | number | boolean | object | null | undefined} LogMessagePart */
/** @typedef {string | Array<LogMessagePart> | (() => string | Array<LogMessagePart>)} LogMessage */

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
   * @param {LogMessage} message
   * @returns {void}
   */
  debug(message) {
    if (this.getDebug()) {
      this.log(message)
    }
  }

  /**
   * @param {LogMessagePart} message
   * @returns {void}
   */
  error(message) {
    console.error(message)
  }

  /**
   * @param {LogMessage} message
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
