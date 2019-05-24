const inflection = require("inflection")
import Logger from "./logger"

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
    var modelType = data.model_type
    var modelName = inflection.camelize(inflection.singularize(modelType.replace(/-/, "_")))
    var modelId = data.model_id
    var modelFileName = inflection.dasherize(inflection.singularize(modelType))
    var modelClass = require(`./models/${modelFileName}`).default
    var modelInstance = new modelClass(data.model.attributes)
    var subscriptions = this.props.subscriptions

    if (data.type == "update") {
      for(var subscription of this.props.subscriptions[modelName]["updates"][modelId]) {
        subscription.onReceived({model: modelInstance})
      }
    } else if (data.type == "destroy") {
      for(var subscription of this.props.subscriptions[modelName]["destroys"][modelId]) {
        subscription.onReceived({model: modelInstance})
      }
    } else if (data.type == "event") {
      for(var subscription of this.props.subscriptions[modelName]["events"][modelId][data.event_name]) {
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
      Logger.log({ modelName })

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
