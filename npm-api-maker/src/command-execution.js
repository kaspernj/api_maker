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
   * @param {(value: Record<string, any>) => void} callback
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
   * @param {(value: Record<string, any> | undefined) => void} callback
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

  /** @returns {Promise<Record<string, any> | undefined>} */
  progress () {
    return this.progressData ? Promise.resolve(this.progressData) : this.progressPromise
  }

  /** @returns {Promise<Record<string, any> | undefined>} */
  received () {
    return this.receivedData ? Promise.resolve(this.receivedData) : this.receivedPromise
  }

  /** @returns {string[]} */
  logs () {
    return [...this.logsData]
  }

  /** @returns {Promise<any>} */
  result () {
    return this.resultPromise
  }

  /** @returns {Promise<any>} */
  then (...args) {
    return this.resultPromise.then(...args)
  }

  /** @returns {Promise<any>} */
  catch (...args) {
    return this.resultPromise.catch(...args)
  }

  /** @returns {Promise<any>} */
  finally (...args) {
    return this.resultPromise.finally(...args)
  }

  /**
   * @param {Record<string, any>} data
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
   * @param {Record<string, any>} data
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
   * @param {any} value
   * @returns {void}
   */
  resolve (value) {
    this.resolveProgressPromise?.(this.progressData)
    this.resolveReceivedPromise?.(this.receivedData)
    this.resolveResultPromise(value)
  }

  /**
   * @param {any} error
   * @returns {void}
   */
  reject (error) {
    this.resolveProgressPromise?.(this.progressData)
    this.resolveReceivedPromise?.(this.receivedData)
    this.rejectResultPromise(error)
  }
}
