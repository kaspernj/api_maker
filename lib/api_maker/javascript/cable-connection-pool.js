import CableSubscriptionPool from "./cable-subscription-pool"
import CableSubscription from "./cable-subscription"

export default class ApiMakerCableConnectionPool {
  static current() {
    if (!window.apiMakerCableConnectionPool)
      window.apiMakerCableConnectionPool = new ApiMakerCableConnectionPool()

    return window.apiMakerCableConnectionPool
  }

  constructor() {
    this.connections = {}
    this.upcomingSubscriptionData = {}
    this.upcomingSubscriptions = []
  }

  connectCreated(modelName, callback) {
    if (!this.upcomingSubscriptionData[modelName])
      this.upcomingSubscriptionData[modelName] = {}

    if (!this.upcomingSubscriptionData[modelName]["creates"])
      this.upcomingSubscriptionData[modelName]["creates"] = true

    if (!this.upcomingSubscriptions[modelName])
      this.upcomingSubscriptions[modelName] = {}

    if (!this.upcomingSubscriptions[modelName]["creates"])
      this.upcomingSubscriptions[modelName]["creates"] = []

    const subscription = new CableSubscription({
      callback: callback,
      modelName: modelName
    })

    this.upcomingSubscriptions[modelName]["creates"].push(subscription)

    this.scheduleConnectUpcoming()

    return subscription
  }

  connectDestroyed(modelName, modelId, callback) {
    if (!this.upcomingSubscriptionData[modelName])
      this.upcomingSubscriptionData[modelName] = {}

    if (!this.upcomingSubscriptionData[modelName]["destroys"])
      this.upcomingSubscriptionData[modelName]["destroys"] = []

    if (!this.upcomingSubscriptionData[modelName]["destroys"].includes(modelId))
      this.upcomingSubscriptionData[modelName]["destroys"].push(modelId)

    if (!this.upcomingSubscriptions[modelName])
      this.upcomingSubscriptions[modelName] = {}

    if (!this.upcomingSubscriptions[modelName]["destroys"])
      this.upcomingSubscriptions[modelName]["destroys"] = {}

    if (!this.upcomingSubscriptions[modelName]["destroys"][modelId])
      this.upcomingSubscriptions[modelName]["destroys"][modelId] = []

    const subscription = new CableSubscription({
      callback: callback,
      modelName: modelName,
      modelId: modelId
    })

    this.upcomingSubscriptions[modelName]["destroys"][modelId].push(subscription)

    this.scheduleConnectUpcoming()

    return subscription
  }

  connectEvent(modelName, modelId, eventName, callback) {
    if (!this.upcomingSubscriptionData[modelName])
      this.upcomingSubscriptionData[modelName] = {}

    if (!this.upcomingSubscriptionData[modelName]["events"])
      this.upcomingSubscriptionData[modelName]["events"] = {}

    if (!this.upcomingSubscriptionData[modelName]["events"][eventName])
      this.upcomingSubscriptionData[modelName]["events"][eventName] = []

    if (!this.upcomingSubscriptionData[modelName]["events"][eventName].includes(modelId))
      this.upcomingSubscriptionData[modelName]["events"][eventName].push(modelId)

    if (!this.upcomingSubscriptions[modelName])
      this.upcomingSubscriptions[modelName] = {}

    if (!this.upcomingSubscriptions[modelName]["events"])
      this.upcomingSubscriptions[modelName]["events"] = {}

    if (!this.upcomingSubscriptions[modelName]["events"])
      this.upcomingSubscriptions[modelName]["events"] = {}

    if (!this.upcomingSubscriptions[modelName]["events"][modelId])
      this.upcomingSubscriptions[modelName]["events"][modelId] = {}

    if (!this.upcomingSubscriptions[modelName]["events"][modelId][eventName])
      this.upcomingSubscriptions[modelName]["events"][modelId][eventName] = []

    const subscription = new CableSubscription({
      callback: callback,
      modelName: modelName,
      modelId: modelId
    })

    this.upcomingSubscriptions[modelName]["events"][modelId][eventName].push(subscription)

    this.scheduleConnectUpcoming()

    return subscription
  }

  connectUpdate(modelName, modelId, args) {
    const callback = args.callback
    const query = args.query

    if (!this.upcomingSubscriptionData[modelName])
      this.upcomingSubscriptionData[modelName] = {}

    if (!this.upcomingSubscriptionData[modelName]["updates"])
      this.upcomingSubscriptionData[modelName]["updates"] = []

    if (!this.upcomingSubscriptionData[modelName]["updates"].includes(modelId))
      this.upcomingSubscriptionData[modelName]["updates"].push(modelId)

    if (!this.upcomingSubscriptions[modelName])
      this.upcomingSubscriptions[modelName] = {}

    if (!this.upcomingSubscriptions[modelName]["updates"])
      this.upcomingSubscriptions[modelName]["updates"] = {}

    if (!this.upcomingSubscriptions[modelName]["updates"][modelId])
      this.upcomingSubscriptions[modelName]["updates"][modelId] = []

    const subscription = new CableSubscription({callback, modelName, modelId})

    this.upcomingSubscriptions[modelName]["updates"][modelId].push(subscription)

    this.scheduleConnectUpcoming()

    return subscription
  }

  connectUpcoming() {
    const subscriptionData = this.upcomingSubscriptionData
    const subscriptions = this.upcomingSubscriptions

    this.upcomingSubscriptionData = {}
    this.upcomingSubscriptions = {}

    const cableSubscriptionPool = new CableSubscriptionPool({
      subscriptionData: subscriptionData,
      subscriptions: subscriptions
    })

    return cableSubscriptionPool
  }

  scheduleConnectUpcoming() {
    if (this.scheduleConnectUpcomingTimeout)
      clearTimeout(this.scheduleConnectUpcomingTimeout)

    this.scheduleConnectUpcomingTimeout = setTimeout(() => this.connectUpcoming(), 50)
  }
}
