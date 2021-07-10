const EventEmitter = require("events")
const Logger = require("./logger.cjs")

module.exports = class ApiMakerCableSubscription {
  constructor() {
    this.events = new EventEmitter()
    this.subscribed = true
  }

  unsubscribe() {
    if (!this.subscribed) {
      Logger.log("Unsubscribed already called")
      return
    }

    Logger.log("Unsubscribe called for subscription")

    this.events.emit("unsubscribed")
    this.subscribed = false
  }
}
