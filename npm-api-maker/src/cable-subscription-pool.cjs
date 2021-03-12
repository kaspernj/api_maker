const ChannelsConsumer = require("./channels-consumer.cjs")
const CommandsPool = require("./commands-pool.cjs")
const Deserializer = require("./deserializer.cjs")
const {digg} = require("@kaspernj/object-digger")
const inflection = require("inflection")
const Logger = require("./logger.cjs")

module.exports = class ApiMakerCableSubscriptionPool {
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
    const {model: modelInstance, model_id: modelId, model_type: modelType, type} = data
    const modelName = inflection.camelize(inflection.singularize(modelType.replace(/-/g, "_")))
    const subscriptions = digg(this, "props", "subscriptions")

    if (type == "update") {
      for(const subscription of subscriptions[modelName]["updates"][modelId]) {
        subscription.onReceived({model: modelInstance})
      }
    } else if (type == "create") {
      for(const subscription of subscriptions[modelName]["creates"]) {
        subscription.onReceived({model: modelInstance})
      }
    } else if (type == "destroy") {
      const destroySubscriptions = digg(subscriptions, modelName, "destroys", modelId)

      for(const subscription of destroySubscriptions) {
        subscription.onReceived({model: modelInstance})
      }
    } else if (type == "event") {
      const eventName = digg(data, "event_name")
      const eventSubscriptions = digg(subscriptions, modelName, "events", eventName, modelId)

      for(const subscription of eventSubscriptions) {
        subscription.onReceived({
          args: data.args,
          eventName: data.event_name,
          model: modelInstance
        })
      }
    } else if (type == "model_class_event") {
      const eventName = digg(data, "event_name")
      const modelClassEventSubscriptions = digg(subscriptions, modelName, "model_class_events", eventName)

      for(const subscription of modelClassEventSubscriptions) {
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
