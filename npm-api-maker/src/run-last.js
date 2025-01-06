export default class RunLast {
  constructor(callback) {
    if (!callback) throw new Error("Empty callback given")

    this.callback = callback
  }

  // Try to batch calls to backend while waiting for the event-queue-call to clear any other jobs before the request and reset on every flush call
  // If only waiting a single time, then other event-queue-jobs might be before us and queue other jobs that might queue calls to the backend
  queue() {
    this.flushTriggerCount = 0
    this.clearTimeout()
    this.flushTrigger()
  }

  flushTrigger = () => {
    if (this.flushTriggerCount >= 10) {
      this.run()
    } else {
      this.flushTriggerCount++
      this.flushTriggerQueue()
    }
  }

  flushTriggerQueue() {
    this.flushTimeout = setTimeout(this.flushTrigger, 0)
  }

  clearTimeout() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
    }
  }

  run() {
    this.clearTimeout()
    this.callback()
  }
}
