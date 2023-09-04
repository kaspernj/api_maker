import EventEmitter from "events"
import Logger from "./logger.mjs"

const logger = new Logger({name: "ApiMaker / CableSubscription"})

export default class ApiMakerCableSubscription {
  constructor () {
    this.events = new EventEmitter()
    this.subscribed = true
  }

  unsubscribe () {
    if (!this.subscribed) {
      logger.log("Unsubscribed already called")
      return
    }

    logger.log("Unsubscribe called for subscription")

    this.subscribed = false
    this.events.emit("unsubscribed")
  }
}
