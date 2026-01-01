import CableSubscriptionPool from "./cable-subscription-pool.js"
import CableSubscription from "./cable-subscription.js"
import {dig} from "diggerize"
import RunLast from "./run-last.js"

const shared = {}

export default class ApiMakerCableConnectionPool {
  cableSubscriptionPools = []
  connections = {}
  upcomingSubscriptionData = {}
  upcomingSubscriptions = {}

  static current () {
    if (!shared.apiMakerCableConnectionPool) shared.apiMakerCableConnectionPool = new ApiMakerCableConnectionPool()

    return shared.apiMakerCableConnectionPool
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

    this.scheduleConnectUpcomingRunLast.queue()

    return subscription
  }

  connectCreated = (modelName, callback) => this.connectModelEvent({callback, value: true, path: [modelName, "creates"]})
  connectEvent = (modelName, modelId, eventName, callback) => this.connectModelEvent({callback, value: modelId, path: [modelName, "events", eventName]})
  connectDestroyed = (modelName, modelId, callback) => this.connectModelEvent({callback, value: modelId, path: [modelName, "destroys"]})
  connectModelClassEvent = (modelName, eventName, callback) => this.connectModelEvent({callback, value: eventName, path: [modelName, "model_class_events"]})
  connectUpdate = (modelName, modelId, callback) => this.connectModelEvent({callback, value: modelId, path: [modelName, "updates"]})

  connectUpcoming = () => {
    const subscriptionData = this.upcomingSubscriptionData
    const subscriptions = this.upcomingSubscriptions

    this.upcomingSubscriptionData = {}
    this.upcomingSubscriptions = {}

    const cableSubscriptionPool = new CableSubscriptionPool()

    cableSubscriptionPool.registerSubscriptions(subscriptions)
    cableSubscriptionPool.connect(subscriptionData)

    this.cableSubscriptionPools.push(cableSubscriptionPool)
  }

  scheduleConnectUpcomingRunLast = new RunLast(this.connectUpcoming)
}
