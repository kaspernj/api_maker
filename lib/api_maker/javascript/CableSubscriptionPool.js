import inflection from "inflection"
import Logger from "./Logger"

export default class ApiMakerCableSubscriptionPool {
  constructor(props) {
    this.props = props
    this.activeSubscriptions = 0
    this.registerSubscriptions()
    this.connect()
  }

  connect() {
    this.subscription = App.cable.subscriptions.create(
      {
        channel: "ApiMaker::SubscriptionsChannel",
        subscription_data: this.props.subscriptionData
      },
      {
        received: (data) => { this.onReceived(data) }
      }
    )
  }

  onReceived(data) {
    let modelName = inflection.camelize(inflection.singularize(data.model.type))
    let modelId = data.model.id
    let modelClass = require(`./Models/${modelName}`).default
    let modelInstance = new modelClass(data.model.attributes)
    let subscriptions = this.props.subscriptions

    if (data.type == "update") {
      for(let subscription of this.props.subscriptions[modelName]["updates"][modelId]) {
        subscription.onReceived({model: modelInstance})
      }
    } else if (data.type == "event") {
      for(let subscription of this.props.subscriptions[modelName]["events"][modelId][data.event_name]) {
        subscription.onReceived({
          args: data.args,
          eventName: data.event_name,
          model: modelInstance
        })
      }
    } else {
      throw new Error(`Unknown type: ${data.type}`)
    }
  }

  onUnsubscribe() {
    Logger.log(`activeSubscriptions before unsub: ${this.activeSubscriptions}`)
    this.activeSubscriptions -= 1
    Logger.log(`activeSubscriptions after unsub: ${this.activeSubscriptions}`)

    if (this.activeSubscriptions <= 0) {
      Logger.log("Unsubscribe from ActionCable subscription")
      this.subscription.unsubscribe()
    }
  }

  registerSubscriptions() {
    Logger.log(`registerSubscriptions: ${this.props.subscriptions.length}`)
    Logger.log(this.props.subscriptions)

    for(let modelName in this.props.subscriptions) {
      Logger.log({ modelName })

      if (this.props.subscriptions[modelName]["events"]) {
        for(let eventName in this.props.subscriptions[modelName]["events"]) {
          for(let modelId in this.props.subscriptions[modelName]["events"][eventName]) {
            for(let subscription of this.props.subscriptions[modelName]["events"][eventName][modelId]) {
              this.connectUnsubscriptionForSubscription(subscription)
            }
          }
        }
      }

      if (this.props.subscriptions[modelName]["updates"]) {
        for(let modelId in this.props.subscriptions[modelName]["updates"]) {
          for(let subscription of this.props.subscriptions[modelName]["updates"][modelId]) {
            this.connectUnsubscriptionForSubscription(subscription)
          }
        }
      }
    }
  }

  connectUnsubscriptionForSubscription(subscription) {
    Logger.log("Connecting to unsubscribe on subscription")
    Logger.log({ subscription })

    this.activeSubscriptions += 1

    subscription.onUnsubscribe(() => {
      Logger.log("Call onUnsubscribe on self")

      this.onUnsubscribe(subscription)
    })
  }
}
