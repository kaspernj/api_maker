import ChannelsConsumer from "channels/consumer"
import {CommandsPool, Deserializer, Logger} from "@kaspernj/api-maker"

const inflection = require("inflection")

export default class ApiMakerCableSubscriptionPool {
  constructor(props) {
    this.props = props
    this.activeSubscriptions = 0
    this.registerSubscriptions()
    this.connect()
  }

  connect() {
    const globalData = CommandsPool.current().globalRequestData

    this.subscription = ChannelsConsumer.subscriptions.create(
      {channel: "ApiMaker::SubscriptionsChannel", global: globalData, subscription_data: this.props.subscriptionData},
      {received: (data) => this.onReceived(data)}
    )
  }

  onReceived(rawData) {
    const data = Deserializer.parse(rawData)
    const modelType = data.model_type
    const modelName = inflection.camelize(inflection.singularize(modelType.replace(/-/g, "_")))
    const modelId = data.model_id
    const modelInstance = data.model
    const subscriptions = this.props.subscriptions

    if (data.type == "update") {
      for(const subscription of subscriptions[modelName]["updates"][modelId]) {
        subscription.onReceived({model: modelInstance})
      }
    } else if (data.type == "create") {
      for(const subscription of subscriptions[modelName]["creates"]) {
        subscription.onReceived({model: modelInstance})
      }
    } else if (data.type == "destroy") {
      for(const subscription of subscriptions[modelName]["destroys"][modelId]) {
        subscription.onReceived({model: modelInstance})
      }
    } else if (data.type == "event") {
      for(const subscription of subscriptions[modelName]["events"][modelId][data.event_name]) {
        subscription.onReceived({
          args: data.args,
          eventName: data.event_name,
          model: modelInstance
        })
      }
    } else if (data.type == "model_class_event") {
      for(const subscription of subscriptions[modelName]["model_class_events"][data.event_name]) {
        subscription.onReceived({
          args: data.args,
          eventName: data.event_name
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

    for(const modelName in this.props.subscriptions) {
      if (this.props.subscriptions[modelName]["creates"]) {
        for(const subscription of this.props.subscriptions[modelName]["creates"]) {
          this.connectUnsubscriptionForSubscription(subscription)
        }
      }

      if (this.props.subscriptions[modelName]["events"]) {
        for(const eventName in this.props.subscriptions[modelName]["events"]) {
          for(const modelId in this.props.subscriptions[modelName]["events"][eventName]) {
            for(const subscription of this.props.subscriptions[modelName]["events"][eventName][modelId]) {
              this.connectUnsubscriptionForSubscription(subscription)
            }
          }
        }
      }

      if (this.props.subscriptions[modelName]["updates"]) {
        for(const modelId in this.props.subscriptions[modelName]["updates"]) {
          for(const subscription of this.props.subscriptions[modelName]["updates"][modelId]) {
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
