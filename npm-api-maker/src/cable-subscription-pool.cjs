const ChannelsConsumer = require("./channels-consumer.cjs")
const CommandsPool = require("./commands-pool.cjs")
const Deserializer = require("./deserializer.cjs")
const {digg} = require("diggerize")
const inflection = require("inflection")
const Logger = require("./logger.cjs")

module.exports = class ApiMakerCableSubscriptionPool {
  constructor() {
    this.activeSubscriptions = 0
    this.connected = false
  }

  connect(subscriptionData) {
    const globalData = CommandsPool.current().globalRequestData

    this.subscription = ChannelsConsumer.subscriptions.create(
      {
        channel: "ApiMaker::SubscriptionsChannel",
        global: globalData,
        subscription_data: subscriptionData
      },
      {
        connected: () => this.onConnected(),
        received: (data) => this.onReceived(data)
      }
    )
    this.connected = true
  }

  forEachSubscription(callback) {
    const modelIdModes = ["destroys", "updates"]
    const subscriptions = digg(this, "subscriptions")

    for (const modelName in subscriptions) {
      for (const modelIdMode of modelIdModes) {
        if (subscriptions[modelName][modelIdMode]) {
          for (const modelId in subscriptions[modelName][modelIdMode]) {
            for (const subscription of subscriptions[modelName][modelIdMode][modelId]) {
              callback({mode: modelIdMode, modelId, modelName, subscription})
            }
          }
        }
      }

      if (subscriptions[modelName]["creates"]) {
        for (const subscription of subscriptions[modelName]["creates"]) {
          callback({mode: "creates", modelName, subscription})
        }
      }

      if (subscriptions[modelName]["model_class_events"]) {
        for (const eventName in subscriptions[modelName]["model_class_events"]) {
          for (const subscription of subscriptions[modelName]["model_class_events"][eventName]) {
            callback({eventName, mode: "model_class_events", modelName, subscription})
          }
        }
      }

      if (subscriptions[modelName]["events"]) {
        for (const modelId in subscriptions[modelName]["events"]) {
          for (const eventName in subscriptions[modelName]["events"][modelId]) {
            for (const subscription of subscriptions[modelName]["events"][modelId][eventName]) {
              callback({eventName, mode: "updates", modelId, modelName, subscription})
            }
          }
        }
      }
    }
  }

  isConnected() {
    return digg(this, "connected")
  }

  onConnected() {
    this.forEachSubscription(({subscription}) => {
      subscription.events.emit("connected")
    })
  }

  onReceived(rawData) {
    const data = Deserializer.parse(rawData)
    const {a: args, e: eventName, m: model, mi: modelId, mt: modelType, t: type} = data
    const subscriptions = digg(this, "subscriptions")

    let modelName

    // This is more effective if it is an option
    if (model) {
      modelName = digg(model.modelClassData(), "name")
    } else {
      modelName = inflection.camelize(inflection.singularize(modelType))
    }

    if (type == "u") {
      for(const subscription of subscriptions[modelName]["updates"][modelId]) {
        subscription.events.emit("received", {model})
      }
    } else if (type == "c") {
      for(const subscription of subscriptions[modelName]["creates"]) {
        subscription.events.emit("received", {model})
      }
    } else if (type == "d") {
      const destroySubscriptions = digg(subscriptions, modelName, "destroys", modelId)

      for(const subscription of destroySubscriptions) {
        subscription.events.emit("received", {model})
      }
    } else if (type == "e") {
      const eventSubscriptions = digg(subscriptions, modelName, "events", eventName, modelId)

      for(const subscription of eventSubscriptions) {
        subscription.events.emit("received", {args, eventName, model})
      }
    } else if (type == "mce") {
      const modelClassEventSubscriptions = digg(subscriptions, modelName, "model_class_events", eventName)

      for(const subscription of modelClassEventSubscriptions) {
        subscription.events.emit("received", {args, eventName})
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
      this.connected = false
    }
  }

  registerSubscriptions(subscriptions) {
    this.subscriptions = subscriptions

    Logger.log(`registerSubscriptions: ${subscriptions.length}`)
    Logger.log(subscriptions)

    for(const modelName in subscriptions) {
      if (subscriptions[modelName]["creates"]) {
        for(const subscription of subscriptions[modelName]["creates"]) {
          this.connectUnsubscriptionForSubscription(subscription)
        }
      }

      if (subscriptions[modelName]["events"]) {
        for(const eventName in subscriptions[modelName]["events"]) {
          for(const modelId in subscriptions[modelName]["events"][eventName]) {
            for(const subscription of subscriptions[modelName]["events"][eventName][modelId]) {
              this.connectUnsubscriptionForSubscription(subscription)
            }
          }
        }
      }

      if (subscriptions[modelName]["updates"]) {
        for(const modelId in subscriptions[modelName]["updates"]) {
          for(const subscription of subscriptions[modelName]["updates"][modelId]) {
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

    subscription.events.addListener("unsubscribed", () => {
      Logger.log("Call onUnsubscribe on self")

      this.onUnsubscribe(subscription)
    })
  }
}
