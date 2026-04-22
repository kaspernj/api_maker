// @ts-check
/** @typedef {object | string | number | boolean | null | undefined | Array<object | string | number | boolean | null | undefined>} CommandValue */
/** @typedef {Record<string, CommandValue>} CommandData */
/**
 * @typedef {object} ProgressData
 * @property {number | undefined} count
 * @property {number | undefined} progress
 * @property {number | undefined} total
 */

/** Shared thenable command handle with progress and log subscriptions. */
export default class ApiMakerCommandExecution {
  /** Constructor. */
  constructor () {
    this.logListeners = []
    this.logsData = []
    this.progressListeners = []
    this.receivedListeners = []

    this.progressPromise = new Promise((resolve) => {
      this.resolveProgressPromise = resolve
    })
    this.receivedPromise = new Promise((resolve) => {
      this.resolveReceivedPromise = resolve
    })
    this.resultPromise = new Promise((resolve, reject) => {
      this.resolveResultPromise = resolve
      this.rejectResultPromise = reject
    })
  }

  /**
   * @param {(value: CommandData) => void} callback
   * @returns {() => void}
   */
  onReceived (callback) {
    this.receivedListeners.push(callback)

    if (this.receivedData) {
      callback(this.receivedData)
    }

    return () => {
      this.receivedListeners = this.receivedListeners.filter((listener) => listener !== callback)
    }
  }

  /**
   * @param {(value: ProgressData | undefined) => void} callback
   * @returns {() => void}
   */
  onProgress (callback) {
    this.progressListeners.push(callback)

    if (this.progressData) {
      callback(this.progressData)
    }

    return () => {
      this.progressListeners = this.progressListeners.filter((listener) => listener !== callback)
    }
  }

  /**
   * @param {(value: string) => void} callback
   * @returns {() => void}
   */
  onLog (callback) {
    this.logListeners.push(callback)

    for (const message of this.logsData) {
      callback(message)
    }

    return () => {
      this.logListeners = this.logListeners.filter((listener) => listener !== callback)
    }
  }

  /** @returns {Promise<ProgressData | undefined>} */
  progress () {
    return this.progressData ? Promise.resolve(this.progressData) : this.progressPromise
  }

  /** @returns {Promise<CommandData | undefined>} */
  received () {
    return this.receivedData ? Promise.resolve(this.receivedData) : this.receivedPromise
  }

  /** @returns {string[]} */
  logs () {
    return [...this.logsData]
  }

  /** @returns {Promise<CommandData>} */
  result () {
    return this.resultPromise
  }

  /**
   * @param {Parameters<Promise<CommandData>["then"]>} args
   * @returns {ReturnType<Promise<CommandData>["then"]>}
   */
  then (...args) {
    return this.resultPromise.then(...args)
  }

  /**
   * @param {Parameters<Promise<CommandData>["catch"]>} args
   * @returns {ReturnType<Promise<CommandData>["catch"]>}
   */
  catch (...args) {
    return this.resultPromise.catch(...args)
  }

  /**
   * @param {Parameters<Promise<CommandData>["finally"]>} args
   * @returns {ReturnType<Promise<CommandData>["finally"]>}
   */
  finally (...args) {
    return this.resultPromise.finally(...args)
  }

  /**
   * @param {CommandData} data
   * @returns {void}
   */
  setReceived (data) {
    this.receivedData = data
    this.resolveReceivedPromise?.(data)

    for (const listener of this.receivedListeners) {
      listener(data)
    }
  }

  /**
   * @param {ProgressData} data
   * @returns {void}
   */
  setProgress (data) {
    this.progressData = data
    this.resolveProgressPromise?.(data)

    for (const listener of this.progressListeners) {
      listener(data)
    }
  }

  /**
   * @param {string} message
   * @returns {void}
   */
  addLog (message) {
    this.logsData.push(message)

    for (const listener of this.logListeners) {
      listener(message)
    }
  }

  /**
   * @param {CommandData} value
   * @returns {void}
   */
  resolve (value) {
    this.resolveProgressPromise?.(this.progressData)
    this.resolveReceivedPromise?.(this.receivedData)
    this.resolveResultPromise(value)
  }

  /**
   * @param {Error} error
   * @returns {void}
   */
  reject (error) {
    this.resolveProgressPromise?.(this.progressData)
    this.resolveReceivedPromise?.(this.receivedData)
    this.rejectResultPromise(error)
  }
}
