import {EventEmitter} from "eventemitter3"
import Logger from "./logger.js"

const logger = new Logger({name: "ApiMaker / CableSubscription"})

/** Cable subscription wrapper with unsubscribe events. */
export default class ApiMakerCableSubscription {
  constructor () {
    this.events = new EventEmitter()
    this.subscribed = true
  }

  /** @returns {void} */
  unsubscribe () {
    if (!this.subscribed) {
      logger.debug("Unsubscribed already called")
      return
    }

    logger.debug("Unsubscribe called for subscription")

    this.subscribed = false
    this.events.emit("unsubscribed")
  }
}
