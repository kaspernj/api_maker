/** Queues calls and runs only the latest callback after queue drains. */
export default class RunLast {
  /** @param {() => void} callback */
  constructor(callback) {
    if (!callback) throw new Error("Empty callback given")

    this.callback = callback
  }

  // Try to batch calls to backend while waiting for the event-queue-call to clear any other jobs before the request and reset on every flush call
  // If only waiting a single time, then other event-queue-jobs might be before us and queue other jobs that might queue calls to the backend
  /** @returns {void} */
  queue() {
    this.flushTriggerCount = 0
    this.clearTimeout()
    this.flushTrigger()
  }

  /** @returns {void} */
  flushTrigger = () => {
    if (this.flushTriggerCount >= 10) {
      this.run()
    } else {
      this.flushTriggerCount++
      this.flushTriggerQueue()
    }
  }

  /** @returns {void} */
  flushTriggerQueue() {
    this.flushTimeout = setTimeout(this.flushTrigger, 0)
  }

  /** @returns {void} */
  clearTimeout() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
    }
  }

  /** @returns {void} */
  run() {
    this.clearTimeout()
    this.callback()
  }
}
