const CableSubscriptionPool = require("./cable-subscription-pool.cjs")
const CableSubscription = require("./cable-subscription.cjs")
const {dig} = require("@kaspernj/object-digger")

module.exports = class ApiMakerCableConnectionPool {
  static current() {
    if (!window.apiMakerCableConnectionPool)
      window.apiMakerCableConnectionPool = new ApiMakerCableConnectionPool()

    return window.apiMakerCableConnectionPool
  }

  constructor() {
    this.cableSubscriptionPools = []
    this.connections = {}
    this.upcomingSubscriptionData = {}
    this.upcomingSubscriptions = []
  }

  connectEventToExistingSubscription({path, subscription}) {
    for (const cableSubscriptionPool of this.cableSubscriptionPools) {
      const existingSubscriptions = dig(cableSubscriptionPool.props.subscriptions, ...path)

      if (existingSubscriptions !== undefined) {
        existingSubscriptions.push(subscription)
        cableSubscriptionPool.connectUnsubscriptionForSubscription(subscription)

        return true
      }
    }

    return false
  }

  connectModelEvent({callback, path}) {
    const subscription = new CableSubscription({callback})

    if (this.connectEventToExistingSubscription({path, subscription})) {
      // Managed to connect to existing connection
      return
    }

    const lastPathPart = path[path.length - 1]

    let currentSubscriptionData = this.upcomingSubscriptionData
    let currentSubscription = this.upcomingSubscriptions

    for (let i = 0; i < path.length; i++) {
      const pathPart = path[i]

      if (!(pathPart in currentSubscriptionData)) {
        if (i == path.length - 1) {
          // Ignore last which have to be pushed to the array
        } else if (i == path.length - 2) {
          currentSubscriptionData[pathPart] = []
        } else {
          currentSubscriptionData[pathPart] = {}
        }
      }

      if (i < path.length - 1) {
        currentSubscriptionData = currentSubscriptionData[pathPart]
      }

      if (!(pathPart in currentSubscription)) {
        if (i == path.length - 1) {
          currentSubscription[pathPart] = []
        } else {
          currentSubscription[pathPart] = {}
        }
      }

      currentSubscription = currentSubscription[pathPart]
    }

    if (!currentSubscriptionData.includes(lastPathPart)) {
      currentSubscriptionData.push(lastPathPart)
    }

    currentSubscription.push(subscription)

    this.scheduleConnectUpcoming()

    return subscription
  }

  connectCreated(modelName, callback) {
    return this.connectModelEvent({callback, path: [modelName, "creates"]})
  }

  connectDestroyed(modelName, modelId, callback) {
    return this.connectModelEvent({callback, path: [modelName, "destroys", modelId]})
  }

  connectUpdate(modelName, modelId, callback) {
    return this.connectModelEvent({callback, path: [modelName, "updates", modelId]})
  }

  connectEvent(modelName, modelId, eventName, callback) {
    return this.connectModelEvent({callback, path: [modelName, "events", eventName, modelId]})
  }

  connectUpcoming() {
    const subscriptionData = this.upcomingSubscriptionData
    const subscriptions = this.upcomingSubscriptions

    this.upcomingSubscriptionData = {}
    this.upcomingSubscriptions = {}

    const cableSubscriptionPool = new CableSubscriptionPool({subscriptionData, subscriptions})

    this.cableSubscriptionPools.push(cableSubscriptionPool)
  }

  scheduleConnectUpcoming() {
    if (this.scheduleConnectUpcomingTimeout)
      clearTimeout(this.scheduleConnectUpcomingTimeout)

    this.scheduleConnectUpcomingTimeout = setTimeout(() => this.connectUpcoming(), 50)
  }
}
