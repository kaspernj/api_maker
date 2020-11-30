import ChannelsConsumer from "channels/consumer"
import CommandsPool from "./commands-pool"
import Deserializer from "./deserializer"
import { Logger } from "@kaspernj/api-maker"

const inflection = require("inflection")

export default class ApiMakerCableSubscriptionPool {
  constructor(props) {
    this.props = props
    this.activeSubscriptionsCount = 0
    this.subscriptions = {}
  }

  subscribe(args) {
    const missingSubscriptions = this.findMissingSubscriptions(args)
    this.connectSubscriptions(missingSubscriptions)
    this.registerSubscriptions(args)
  }

  findMissingSubscriptions({subscriptionData}) {
    const upcomingSubscriptions = {}

    for (const modelName in subscriptionData) {
      for (const eventName in subscriptionData[modelName]) {
        if (!this.subscriptions[modelName] || !this.subscriptions[modelName][eventName]) {
          if(!upcomingSubscriptions[modelName]) {
            upcomingSubscriptions[modelName] = {}
          }

          upcomingSubscriptions[modelName][eventName] = subscriptionData[modelName][eventName]
        } else if (subscriptionData[modelName][eventName] === this.subscriptions[modelName][eventName]) {
          // already added
        }

        // TODO handle arrays
      }
    }

    return upcomingSubscriptions
  }

  connectSubscriptions(subscriptions) {
    const globalData = CommandsPool.current().globalRequestData

    // TODO find all subscriptions that arent connected
    const createdSubscription = ChannelsConsumer
      .subscriptions
      .create({
        channel: "ApiMaker::SubscriptionsChannel",
        global: globalData,
        subscription_data: subscriptions
      }, {
        received: (data) => this.onReceived(data)
      })
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

    // TODO this count should be per subscription
    if (this.activeSubscriptions <= 0) {
      Logger.log("Unsubscribe from ActionCable subscription")
      this.subscription.unsubscribe()
    }
  }

  registerSubscriptions({subscriptions}) {
    Logger.log(`registerSubscriptions: ${subscriptions.length}`)
    Logger.log(subscriptions)

    for (const modelName in subscriptions) {
      if (subscriptions[modelName]["creates"]) {
        for (const subscription of subscriptions[modelName]["creates"]) {
          this.connectUnsubscriptionForSubscription(subscription)
        }
      }

      if (this.subscriptions[modelName] && this.subscriptions[modelName]["events"]) {
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

    subscription.onUnsubscribe(() => {
      Logger.log("Call onUnsubscribe on self")

      this.onUnsubscribe(subscription)
    })
  }
}
