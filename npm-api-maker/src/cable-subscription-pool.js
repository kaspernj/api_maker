import * as inflection from "inflection"
import {digg} from "diggerize"
import CommandsPool from "./commands-pool.js" // eslint-disable-line sort-imports
import Deserializer from "./deserializer.js"
import getChannelsConsumer from "./channels-consumer.js"
import Logger from "./logger.js" // eslint-disable-line sort-imports

const logger = new Logger({name: "ApiMaker / CableSubscriptionPool"})
const AUTH_REFRESH_TIMEOUT_MS = 5000

/** Subscription pool for sharing channel subscriptions. */
export default class ApiMakerCableSubscriptionPool {
  /** Constructor. */
  constructor () {
    this.activeSubscriptions = 0
    this.authRefreshCallbacks = {}
    this.connected = false
    this.skipDisconnectHandling = false
  }

  /** connect. */
  connect (subscriptionData) {
    const globalData = CommandsPool.current().globalRequestData

    logger.debug(() => ["Creating subscription", {subscriptionData}])

    this.subscription = getChannelsConsumer().subscriptions.create(
      {
        channel: "ApiMaker::SubscriptionsChannel",
        global: globalData,
        subscription_data: subscriptionData
      },
      {
        connected: this.onConnected,
        disconnected: this.onDisconnected,
        received: this.onReceived,
        rejected: this.onRejected,
        subscribed: this.onSubscribed
      }
    )
    this.connected = true
  }

  /**
   * Refreshes auth for the existing subscription without recreating the pool.
   *
   * @param {Record<string, any>} args
   * @returns {Promise<void>}
   */
  refreshAuthentication (args) {
    if (!this.connected || !this.subscription) {
      return Promise.resolve()
    }

    if (this.authRefreshCallbacks.promise) {
      return this.authRefreshCallbacks.promise
    }

    this.authRefreshCallbacks.promise = new Promise((resolve, reject) => {
      this.authRefreshCallbacks.resolve = resolve
      this.authRefreshCallbacks.reject = reject
      this.authRefreshCallbacks.timeoutId = setTimeout(() => {
        this.rejectAuthRefresh(new Error("Subscription auth refresh timed out"))
      }, AUTH_REFRESH_TIMEOUT_MS)
    })

    this.subscription.perform("refresh_auth", args)

    return this.authRefreshCallbacks.promise
  }

  /** forEachSubscription. */
  forEachSubscription (callback) {
    const modelIdModes = ["destroys", "updates"]
    const subscriptions = digg(this, "subscriptions")

    for (const modelName in subscriptions) {
      for (const modelIdMode of modelIdModes) {
        if (subscriptions[modelName][modelIdMode]) {
          for (const modelId in subscriptions[modelName][modelIdMode]) {
            // eslint-disable-next-line max-depth
            for (const subscription of subscriptions[modelName][modelIdMode][modelId]) {
              callback({mode: modelIdMode, modelId, modelName, subscription})
            }
          }
        }
      }

      if (subscriptions[modelName].creates) {
        for (const subscription of subscriptions[modelName].creates) {
          callback({mode: "creates", modelName, subscription})
        }
      }

      if (subscriptions[modelName].model_class_events) {
        for (const eventName in subscriptions[modelName].model_class_events) {
          for (const subscription of subscriptions[modelName].model_class_events[eventName]) {
            callback({eventName, mode: "model_class_events", modelName, subscription})
          }
        }
      }

      if (subscriptions[modelName].events) {
        for (const modelId in subscriptions[modelName].events) {
          for (const eventName in subscriptions[modelName].events[modelId]) {
            // eslint-disable-next-line max-depth
            for (const subscription of subscriptions[modelName].events[modelId][eventName]) {
              callback({eventName, mode: "updates", modelId, modelName, subscription})
            }
          }
        }
      }
    }
  }

  /** isConnected. */
  isConnected = () => digg(this, "connected")

  /** onConnected. */
  onConnected = () => {
    this.connected = true

    this.forEachSubscription(({subscription}) => {
      subscription.events.emit("connected")
    })
  }

  /** onDisconnected. */
  onDisconnected = () => {
    this.connected = false

    if (this.skipDisconnectHandling) {
      return
    }

    this.rejectAuthRefresh(new Error("Subscription auth refresh was interrupted by a disconnect"))
  }

  /** onReceived. */
  onReceived = (rawData) => {
    if (rawData.type == "api_maker_subscription_auth_refreshed") {
      this.resolveAuthRefresh()
      return
    }

    if (rawData.type == "api_maker_subscription_auth_refresh_error") {
      this.rejectAuthRefresh(new Error(rawData.error?.message || "Subscription auth refresh failed"))
      return
    }

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
      for (const subscription of subscriptions[modelName].updates[modelId]) {
        subscription.events.emit("received", {model})
      }
    } else if (type == "c") {
      for (const subscription of subscriptions[modelName].creates) {
        subscription.events.emit("received", {model})
      }
    } else if (type == "d") {
      const destroySubscriptions = digg(subscriptions, modelName, "destroys", modelId)

      for (const subscription of destroySubscriptions) {
        subscription.events.emit("received", {model})
      }
    } else if (type == "e") {
      const eventSubscriptions = digg(subscriptions, modelName, "events", eventName, modelId)

      for (const subscription of eventSubscriptions) {
        subscription.events.emit("received", {args, eventName, model})
      }
    } else if (type == "mce") {
      const modelClassEventSubscriptions = digg(subscriptions, modelName, "model_class_events", eventName)

      for (const subscription of modelClassEventSubscriptions) {
        subscription.events.emit("received", {args, eventName})
      }
    } else {
      throw new Error(`Unknown type: ${data.type}`)
    }
  }

  /** onSubscribed. */
  onSubscribed = () => {
    logger.debug("onSubscribed")
  }

  /** onRejected. */
  onRejected = () => {
    this.connected = false

    if (this.skipDisconnectHandling) {
      return
    }

    this.rejectAuthRefresh(new Error("Subscription auth refresh was rejected"))
  }

  /** @returns {void} */
  clearAuthRefreshCallbacks () {
    if (this.authRefreshCallbacks.timeoutId) {
      clearTimeout(this.authRefreshCallbacks.timeoutId)
    }

    this.authRefreshCallbacks = {}
  }

  /** @returns {void} */
  resolveAuthRefresh () {
    this.authRefreshCallbacks.resolve?.()
    this.clearAuthRefreshCallbacks()
  }

  /**
   * @param {Error} error
   * @returns {void}
   */
  rejectAuthRefresh (error) {
    this.authRefreshCallbacks.reject?.(error)
    this.clearAuthRefreshCallbacks()
  }

  /** onUnsubscribe. */
  onUnsubscribe () {
    logger.debug(() => `activeSubscriptions before unsub: ${this.activeSubscriptions}`)
    this.activeSubscriptions -= 1
    logger.debug(() => `activeSubscriptions after unsub: ${this.activeSubscriptions}`)

    if (this.activeSubscriptions <= 0) {
      logger.debug("Unsubscribe from ActionCable subscription")
      this.subscription.unsubscribe()
      this.connected = false
    }
  }

  /** registerSubscriptions. */
  registerSubscriptions (subscriptions) {
    this.subscriptions = subscriptions

    logger.debug(() => ["registerSubscriptions", {subscriptions}])

    for (const modelName in subscriptions) {
      if (subscriptions[modelName].creates) {
        for (const subscription of subscriptions[modelName].creates) {
          this.connectUnsubscriptionForSubscription(subscription)
        }
      }

      if (subscriptions[modelName].events) {
        for (const eventName in subscriptions[modelName].events) {
          for (const modelId in subscriptions[modelName].events[eventName]) {
            // eslint-disable-next-line max-depth
            for (const subscription of subscriptions[modelName].events[eventName][modelId]) {
              this.connectUnsubscriptionForSubscription(subscription)
            }
          }
        }
      }

      if (subscriptions[modelName].updates) {
        for (const modelId in subscriptions[modelName].updates) {
          for (const subscription of subscriptions[modelName].updates[modelId]) {
            this.connectUnsubscriptionForSubscription(subscription)
          }
        }
      }
    }
  }

  /** connectUnsubscriptionForSubscription. */
  connectUnsubscriptionForSubscription (subscription) {
    logger.debug(() => ["Connecting to unsubscribe on subscription", {subscription}])

    this.activeSubscriptions += 1

    subscription.events.addListener("unsubscribed", () => {
      logger.debug("Call onUnsubscribe on self")

      // @ts-expect-error
      this.onUnsubscribe(subscription)
    })
  }

  /** @returns {void} */
  reset () {
    this.skipDisconnectHandling = true
    this.connected = false
    this.rejectAuthRefresh(new Error("Subscription pool was reset"))

    if (this.subscription?.unsubscribe) {
      this.subscription.unsubscribe()
    }

    this.subscription = undefined
    this.subscriptions = undefined
    this.activeSubscriptions = 0
  }
}
