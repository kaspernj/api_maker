import { Logger } from "@kaspernj/api-maker"

export default class ApiMakerCableSubscription {
  constructor(props) {
    this.props = props
    this.onUnsubscribeCallbacks = []
    this.subscribed = true
  }

  onReceived(data) {
    this.props.callback.apply(null, [data])
  }

  onUnsubscribe(callback) {
    this.onUnsubscribeCallbacks.push(callback)
  }

  unsubscribe() {
    if (!this.subscribed) {
      Logger.log("Unsubscribed already called")
      return
    }

    Logger.log(`Unsubscribe called: ${this.onUnsubscribeCallbacks.length}`)

    for(const onUnsubscribeCallback of this.onUnsubscribeCallbacks) {
      Logger.log("onUnsubscribe called for a callback")
      onUnsubscribeCallback.call()
    }

    this.subscribed = false
  }
}
