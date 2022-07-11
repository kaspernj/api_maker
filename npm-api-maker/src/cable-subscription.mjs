import EventEmitter from "events"
import Logger from "./logger.mjs"

export default class ApiMakerCableSubscription {
  constructor () {
    this.events = new EventEmitter()
    this.subscribed = true
  }

  unsubscribe () {
    if (!this.subscribed) {
      Logger.log("Unsubscribed already called")
      return
    }

    Logger.log("Unsubscribe called for subscription")

    this.events.emit("unsubscribed")
    this.subscribed = false
  }
}
