import Logger from "./Logger"

export default class ApiMakerCableSubscription {
  constructor(props) {
    this.props = props
    this.onUnsubscribeCallbacks = []
    this.subscribed = true
  }

  onReceived(data) {
    this.props.callback.apply(data)
  }

  onUnsubscribe(callback) {
    this.onUnsubscribeCallbacks.push(callback)
  }

  unsubscribe() {
    Logger.log(`Unsubscribe called: ${this.onUnsubscribeCallbacks.length}`)
    this.subscribed = false

    for(var onUnsubscribeCallback of this.onUnsubscribeCallbacks) {
      Logger.log("onUnsubscribeCallback")
      onUnsubscribeCallback.apply()
    }
  }
}
