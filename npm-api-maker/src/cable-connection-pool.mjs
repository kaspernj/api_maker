import CableSubscriptionPool from "./cable-subscription-pool.mjs"
import CableSubscription from "./cable-subscription.mjs"
import {dig} from "diggerize"

export default class ApiMakerCableConnectionPool {
  static current () {
    if (!global.apiMakerCableConnectionPool)
      global.apiMakerCableConnectionPool = new ApiMakerCableConnectionPool()

    return global.apiMakerCableConnectionPool
  }

  constructor () {
    this.cableSubscriptionPools = []
    this.connections = {}
    this.upcomingSubscriptionData = {}
    this.upcomingSubscriptions = {}
  }

  connectEventToExistingSubscription ({path, subscription, value}) {
    for (const cableSubscriptionPool of this.cableSubscriptionPools) {
      if (!cableSubscriptionPool.isConnected()) {
        continue
      }

      let existingSubscriptions

      if (value === true) {
        existingSubscriptions = dig(cableSubscriptionPool.subscriptions, ...path)
      } else {
        existingSubscriptions = dig(cableSubscriptionPool.subscriptions, ...path, value)
      }

      if (existingSubscriptions !== undefined) {
        if (!Array.isArray(existingSubscriptions)) {
          throw new Error(`existingSubscriptions wasn't an array: ${typeof existingSubscriptions} (${dig(existingSubscriptions, "constructor", "name")})`)
        }

        existingSubscriptions.push(subscription)
        cableSubscriptionPool.connectUnsubscriptionForSubscription(subscription)

        return true
      }
    }

    return false
  }

  connectModelEvent ({callback, path, value}) {
    const subscription = new CableSubscription()

    subscription.events.addListener("received", callback)

    if (this.connectEventToExistingSubscription({path, subscription, value})) {
      // Managed to connect to existing connection
      return subscription
    }

    let currentSubscriptionData = this.upcomingSubscriptionData
    let currentSubscription = this.upcomingSubscriptions

    for (let i = 0; i < path.length; i++) {
      const pathPart = path[i]

      if (!(pathPart in currentSubscriptionData)) {
        if (i == path.length - 1) {
          currentSubscriptionData[pathPart] = []
        } else {
          currentSubscriptionData[pathPart] = {}
        }
      }

      currentSubscriptionData = currentSubscriptionData[pathPart]

      if (!(pathPart in currentSubscription)) {
        if (value === true && i == path.length - 1) {
          currentSubscription[pathPart] = []
        } else {
          currentSubscription[pathPart] = {}
        }
      }

      currentSubscription = currentSubscription[pathPart]
    }

    if (!currentSubscriptionData.includes(value)) {
      currentSubscriptionData.push(value)
    }

    if (value === true) {
      currentSubscription.push(subscription)
    } else {
      if (!(value in currentSubscription)) {
        currentSubscription[value] = []
      }

      currentSubscription[value].push(subscription)
    }

    this.scheduleConnectUpcoming()

    return subscription
  }

  connectCreated (modelName, callback) {
    return this.connectModelEvent({callback, value: true, path: [modelName, "creates"]})
  }

  connectEvent (modelName, modelId, eventName, callback) {
    return this.connectModelEvent({callback, value: modelId, path: [modelName, "events", eventName]})
  }

  connectDestroyed (modelName, modelId, callback) {
    return this.connectModelEvent({callback, value: modelId, path: [modelName, "destroys"]})
  }

  connectModelClassEvent (modelName, eventName, callback) {
    return this.connectModelEvent({callback, value: eventName, path: [modelName, "model_class_events"]})
  }

  connectUpdate (modelName, modelId, callback) {
    return this.connectModelEvent({callback, value: modelId, path: [modelName, "updates"]})
  }

  connectUpcoming () {
    const subscriptionData = this.upcomingSubscriptionData
    const subscriptions = this.upcomingSubscriptions

    this.upcomingSubscriptionData = {}
    this.upcomingSubscriptions = {}

    const cableSubscriptionPool = new CableSubscriptionPool()

    cableSubscriptionPool.registerSubscriptions(subscriptions)
    cableSubscriptionPool.connect(subscriptionData)

    this.cableSubscriptionPools.push(cableSubscriptionPool)
  }

  scheduleConnectUpcoming () {
    if (this.scheduleConnectUpcomingTimeout)
      clearTimeout(this.scheduleConnectUpcomingTimeout)

    this.scheduleConnectUpcomingTimeout = setTimeout(() => this.connectUpcoming(), 0)
  }
}
