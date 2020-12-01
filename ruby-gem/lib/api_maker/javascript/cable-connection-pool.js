import CableSubscriptionPool from "./cable-subscription-pool"
import CableSubscription from "./cable-subscription"
import {dig} from "@kaspernj/object-digger"

export default class ApiMakerCableConnectionPool {
  static current() {
    if (!window.apiMakerCableConnectionPool)
      window.apiMakerCableConnectionPool = new ApiMakerCableConnectionPool()

    return window.apiMakerCableConnectionPool
  }

  constructor() {
    this.subscriptionDataToConnectionMapping = {}
    this.upcomingSubscriptionData = {}
    this.upcomingSubscriptions = []
  }

  connectCreated(modelName, callback) {
    const subscription = new CableSubscription({
      callback: callback,
      modelName: modelName
    })
    const existingConnection = dig(this.subscriptionDataToConnectionMapping, modelName, "creates")

    if (existingConnection && existingConnection.isActive()) {
      existingConnection.addSubscription(subscription)
    } else {
      if (!this.upcomingSubscriptionData[modelName])
        this.upcomingSubscriptionData[modelName] = {}

      if (!this.upcomingSubscriptionData[modelName]["creates"])
        this.upcomingSubscriptionData[modelName]["creates"] = true

      if (!this.upcomingSubscriptions[modelName])
        this.upcomingSubscriptions[modelName] = {}

      if (!this.upcomingSubscriptions[modelName]["creates"])
        this.upcomingSubscriptions[modelName]["creates"] = []

      this.upcomingSubscriptions[modelName]["creates"].push(subscription)
      this.scheduleConnectUpcoming()
    }

    return subscription
  }

  connectDestroyed(modelName, modelId, callback) {
    const subscription = new CableSubscription({
      callback: callback,
      modelName: modelName,
      modelid: modelId
    })
    const existingconnection = dig(this.subscriptionDataToConnectionMapping, modelName, "destroys", modelId)

    if (existingconnection && existingConnection.isActive()) {
      existingconnection.addSubscription(subscription)
    } else {
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

      this.upcomingSubscriptions[modelName]["destroys"][modelId].push(subscription)

      this.scheduleConnectUpcoming()
    }

    return subscription
  }

  connectEvent(modelName, modelId, eventName, callback) {
    const subscription = new CableSubscription({
      callback: callback,
      modelName: modelName,
      modelId: modelId
    })
    const existingConnection = dig(this.subscriptionDataToConnectionMapping, modelName, "events", modelId, "eventName")

    if (existingConnection && existingConnection.isActive()) {
      existingConnection.addSubscription(subscription)
    } else {
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

      this.upcomingSubscriptions[modelName]["events"][modelId][eventName].push(subscription)

      this.scheduleConnectUpcoming()
    }

    return subscription
  }

  connectModelClassEvent(modelName, eventName, callback) {
    const subscription = new CableSubscription({
      callback: callback,
      modelName: modelName
    })
    const existingConnection = dig(this.subscriptionDataToConnectionMapping, modelName, "model_class_events", eventName)

    if (existingConnection && existingConnection.isActive()) {
      existingConnection.addSubscription(subscription)
    } else {
      if (!(modelName in this.upcomingSubscriptionData))
        this.upcomingSubscriptionData[modelName] = {}

      if (!("model_class_events" in this.upcomingSubscriptionData[modelName]))
        this.upcomingSubscriptionData[modelName]["model_class_events"] = []

      if (!this.upcomingSubscriptionData[modelName]["model_class_events"].includes(eventName))
        this.upcomingSubscriptionData[modelName]["model_class_events"].push(eventName)

      if (!(modelName in this.upcomingSubscriptions))
        this.upcomingSubscriptions[modelName] = {}

      if (!("model_class_events" in this.upcomingSubscriptions[modelName]))
        this.upcomingSubscriptions[modelName]["model_class_events"] = {}

      if (!(eventName in this.upcomingSubscriptions[modelName]["model_class_events"]))
        this.upcomingSubscriptions[modelName]["model_class_events"][eventName] = []

      this.upcomingSubscriptions[modelName]["model_class_events"][eventName].push(subscription)

      this.scheduleConnectUpcoming()
    }

    return subscription
  }

  connectUpdate(modelName, modelId, callback) {
    const subscription = new CableSubscription({
      callback: callback,
      modelName: modelName,
      modelId: modelId
    })
    const existingConnection = dig(this.subscriptionDataToConnectionMapping, modelName, "updates", modelId)

    if (existingConnection && existingConnection.isActive()) {
      existingConnection.addSubscription(subscription)
    } else {
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

      this.upcomingSubscriptions[modelName]["updates"][modelId].push(subscription)

      this.scheduleConnectUpcoming()
    }

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

    this.updateSubscriptionDataToConnectionMapping(subscriptionData, cableSubscriptionPool)

    return cableSubscriptionPool
  }

  scheduleConnectUpcoming() {
    if (this.scheduleConnectUpcomingTimeout)
      clearTimeout(this.scheduleConnectUpcomingTimeout)

    this.scheduleConnectUpcomingTimeout = setTimeout(() => this.connectUpcoming(), 50)
  }

  updateSubscriptionDataToConnectionMapping(subscriptionData, cableSubscriptionPool) {
    for(const modelName in subscriptionData) {
      if (subscriptionData[modelName]["creates"]) {
        this.updateSubscriptionDataToConnectionMappingWithCreates(modelName, cableSubscriptionPool)
      }

      if (subscriptionData[modelName]["events"]) {
        for(const eventName in subscriptionData[modelName]["events"]) {
          for(const modelId in subscriptionData[modelName]["events"][eventName]) {
            this.updateSubscriptionDataToConnectionMappingWithEvents(modelName, eventName, modelId, cableSubscriptionPool)
          }
        }
      }

      if (subscriptionData[modelName]["updates"]) {
        for(const modelId in subscriptionData[modelName]["updates"]) {
          this.updateSubscriptionDataToConnectionMappingWithUpdates(modelName, modelId, cableSubscriptionPool)
        }
      }

      if (subscriptionData[modelName]["destroys"]) {
        for(const modelId in subscriptionData[modelName]["destroys"]) {
          this.updateSubscriptionDataToConnectionMappingWithDestroys(modelName, modelId, cableSubscriptionPool)
        }
      }

      if (subscriptionData[modelName]["model_class_events"]) {
        for(const eventName in subscriptionData[modelName]["model_class_events"]) {
          this.updateSubscriptionDataToConnectionMappingWithModelClassEvents(modelName, eventName, cableSubscriptionPool)
        }
      }
    }
  }

  updateSubscriptionDataToConnectionMappingWithCreates(modelName, cableSubscriptionPool) {
    if (!this.subscriptionDataToConnectionMapping[modelName]) {
      this.subscriptionDataToConnectionMapping[modelName] = {}
    }

    this.subscriptionDataToConnectionMapping[modelName]["creates"] = cableSubscriptionPool
  }

  updateSubscriptionDataToConnectionMappingWithDestroys(modelName, modelId, cableSubscriptionPool) {
    if (!this.subscriptionDataToConnectionMapping[modelName]) {
      this.subscriptionDataToConnectionMapping[modelName] = {}
    }

    if (!this.subscriptionDataToConnectionMapping[modelName]["destroys"]) {
      this.subscriptionDataToConnectionMapping[modelName]["destroys"] = {}
    }

    this.subscriptionDataToConnectionMapping[modelName]["destroys"][modelId] = cableSubscriptionPool
  }

  updateSubscriptionDataToConnectionMappingWithEvents(modelName, eventName, modelId, cableSubscriptionPool) {
    if (!this.subscriptionDataToConnectionMapping[modelName])
      this.subscriptionDataToConnectionMapping[modelName] = {}

    if (!this.subscriptionDataToConnectionMapping[modelName]["events"])
      this.subscriptionDataToConnectionMapping[modelName]["events"] = {}

    if (!this.subscriptionDataToConnectionMapping[modelName]["events"][eventName])
      this.subscriptionDataToConnectionMapping[modelName]["events"][eventName] = {}

    this.subscriptionDataToConnectionMapping[modelName]["events"][eventName][modelId] = cableSubscriptionPool
  }

  updateSubscriptionDataToConnectionMappingWithUpdates(modelName, modelId, cableSubscriptionPool) {
    if (!this.subscriptionDataToConnectionMapping[modelName]) {
      this.subscriptionDataToConnectionMapping[modelName] = {}
    }

    if (!this.subscriptionDataToConnectionMapping[modelName]["updates"]) {
      this.subscriptionDataToConnectionMapping[modelName]["updates"] = {}
    }

    this.subscriptionDataToConnectionMapping[modelName]["updates"][modelId] = cableSubscriptionPool
  }

  updateSubscriptionDataToConnectionMappingWithModelClassEvents(modelName, eventName, cableSubscriptionPool) {
    if (!this.subscriptionDataToConnectionMapping[modelName])
      this.subscriptionDataToConnectionMapping[modelName] = {}

    if (!this.subscriptionDataToConnectionMapping[modelName]["model_class_events"])
      this.subscriptionDataToConnectionMapping[modelName]["model_class_events"] = {}

    this.subscriptionDataToConnectionMapping[modelName]["model_class_events"][eventName] = cableSubscriptionPool
  }
}
