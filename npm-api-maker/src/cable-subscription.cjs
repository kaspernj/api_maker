const EventEmitter = require("events")
const Logger = require("./logger.cjs")

module.exports = class ApiMakerCableSubscription {
  constructor(props) {
    this.events = new EventEmitter()
    this.props = props
    this.subscribed = true
  }

  onReceived(data) {
    this.props.callback.apply(null, [data])
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
