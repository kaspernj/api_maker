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
    existingConnection = dig(this.subscriptionDataToConnectionMapping, modelName, "creates")

    const subscription = new CableSubscription({
      callback: callback,
      modelName: modelName
    })

    if (existingConnection) {
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

  connectDestroyed(modelname, modelid, callback) {
    const subscription = new cablesubscription({
      callback: callback,
      modelname: modelname,
      modelid: modelid
    })

    existingconnection = dig(this.subscriptiondatatoconnectionmappign, modelname, "destroys", modelid)

    if (existingconnection) {
      existingconnection.addsubscription(subscription)
    } else {
      if (!this.upcomingsubscriptiondata[modelname])
        this.upcomingsubscriptiondata[modelname] = {}

      if (!this.upcomingsubscriptiondata[modelname]["destroys"])
        this.upcomingsubscriptiondata[modelname]["destroys"] = []

      if (!this.upcomingsubscriptiondata[modelname]["destroys"].includes(modelid))
        this.upcomingsubscriptiondata[modelname]["destroys"].push(modelid)

      if (!this.upcomingsubscriptions[modelname])
        this.upcomingsubscriptions[modelname] = {}

      if (!this.upcomingsubscriptions[modelname]["destroys"])
        this.upcomingsubscriptions[modelname]["destroys"] = {}

      if (!this.upcomingsubscriptions[modelname]["destroys"][modelid])
        this.upcomingsubscriptions[modelname]["destroys"][modelid] = []

      this.upcomingsubscriptions[modelname]["destroys"][modelid].push(subscription)

      this.scheduleconnectupcoming()
    }

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

  connectModelClassEvent(modelName, eventName, callback) {
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

    const subscription = new CableSubscription({
      callback: callback,
      modelName: modelName
    })

    this.upcomingSubscriptions[modelName]["model_class_events"][eventName].push(subscription)

    this.scheduleConnectUpcoming()

    return subscription
  }

  connectUpdate(modelName, modelId, callback) {
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

    const subscription = new CableSubscription({
      callback: callback,
      modelName: modelName,
      modelId: modelId
    })

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

    // update the mapping
    this.addConnectCreatedToConnectionMapping(cableSubscriptionPool)
    this.addConnectDestroyedToConnectionMapping(cableSubscriptionPool)

    return cableSubscriptionPool
  }

  scheduleConnectUpcoming() {
    if (this.scheduleConnectUpcomingTimeout)
      clearTimeout(this.scheduleConnectUpcomingTimeout)

    this.scheduleConnectUpcomingTimeout = setTimeout(() => this.connectUpcoming(), 50)
  }

  addConnectCreatedToConnectionMapping(modelName, subscriptionConnection) {
    if (!this.subscriptionDataToConnectionMapping[modelName]) {
      this.subscriptionDataToConnectionMapping[modelName] = {}
    }

    this.upcomingSubscriptionData[modelName]["creates"] = subscriptionConnection
  }

  addConnectDestroyedToConnectionMapping(modelName, modelId, subscriptionConnection) {
    if (!this.subscriptionDataToConnectionMapping[modelName]) {
      this.subscriptionDataToConnectionMapping[modelname] = {}
    }

    if (!this.subscriptionDataToConnectionMapping[modelName]["destroys"]) {
      this.subscriptionDataToConnectionMapping[modelName]["destroys"] = {}
    }

    this.subscriptionDataToConnectionMapping[modelName]["destroys"][modelId] = subscriptionConnection
  }
}
