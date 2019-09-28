import CommandsPool from "./commands-pool"
import Deserializer from "./deserializer"
import Logger from "./logger"

const inflection = require("inflection")

export default class ApiMakerCableSubscriptionPool {
  constructor(props) {
    this.props = props
    this.activeSubscriptions = 0
    this.registerSubscriptions()
    this.connect()
  }

  connect() {
    var globalData = CommandsPool.current().globalRequestData

    this.subscription = App.cable.subscriptions.create(
      {channel: "ApiMaker::SubscriptionsChannel", global: globalData, subscription_data: this.props.subscriptionData},
      {received: (data) => this.onReceived(data)}
    )
  }

  onReceived(rawData) {
    var data = Deserializer.parse(rawData)
    var modelType = data.model_type
    var modelName = inflection.camelize(inflection.singularize(modelType.replace(/-/g, "_")))
    var modelId = data.model_id
    var modelInstance = data.model
    var subscriptions = this.props.subscriptions

    if (data.type == "update") {
      for(var subscription of subscriptions[modelName]["updates"][modelId]) {
        subscription.onReceived({model: modelInstance})
      }
    } else if (data.type == "create") {
      for(var subscription of subscriptions[modelName]["creates"]) {
        subscription.onReceived({model: modelInstance})
      }
    } else if (data.type == "destroy") {
      for(var subscription of subscriptions[modelName]["destroys"][modelId]) {
        subscription.onReceived({model: modelInstance})
      }
    } else if (data.type == "event") {
      for(var subscription of subscriptions[modelName]["events"][modelId][data.event_name]) {
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

    for(var modelName in this.props.subscriptions) {
      if (this.props.subscriptions[modelName]["creates"]) {
        for(var subscription of this.props.subscriptions[modelName]["creates"]) {
          this.connectUnsubscriptionForSubscription(subscription)
        }
      }

      if (this.props.subscriptions[modelName]["events"]) {
        for(var eventName in this.props.subscriptions[modelName]["events"]) {
          for(var modelId in this.props.subscriptions[modelName]["events"][eventName]) {
            for(var subscription of this.props.subscriptions[modelName]["events"][eventName][modelId]) {
              this.connectUnsubscriptionForSubscription(subscription)
            }
          }
        }
      }

      if (this.props.subscriptions[modelName]["updates"]) {
        for(var modelId in this.props.subscriptions[modelName]["updates"]) {
          for(var subscription of this.props.subscriptions[modelName]["updates"][modelId]) {
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
