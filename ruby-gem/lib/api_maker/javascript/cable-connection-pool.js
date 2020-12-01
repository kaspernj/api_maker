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

  connectDestroyed(modelname, modelId, callback) {
    const subscription = new cablesubscription({
      callback: callback,
      modelname: modelname,
      modelid: modelId
    })

    existingconnection = dig(this.subscriptionDataToConnectionMapping, modelName, "destroys", modelId)

    if (existingconnection) {
      existingconnection.addSubscription(subscription)
    } else {
      if (!this.upcomingsubscriptiondata[modelname])
        this.upcomingsubscriptiondata[modelname] = {}

      if (!this.upcomingsubscriptiondata[modelname]["destroys"])
        this.upcomingsubscriptiondata[modelname]["destroys"] = []

      if (!this.upcomingsubscriptiondata[modelname]["destroys"].includes(modelId))
        this.upcomingsubscriptiondata[modelname]["destroys"].push(modelId)

      if (!this.upcomingsubscriptions[modelname])
        this.upcomingsubscriptions[modelname] = {}

      if (!this.upcomingsubscriptions[modelname]["destroys"])
        this.upcomingsubscriptions[modelname]["destroys"] = {}

      if (!this.upcomingsubscriptions[modelname]["destroys"][modelId])
        this.upcomingsubscriptions[modelname]["destroys"][modelId] = []

      this.upcomingsubscriptions[modelname]["destroys"][modelId].push(subscription)

      this.scheduleconnectupcoming()
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

    if (existingConnection) {
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

    existingConnection = dig(this.subscriptionDataToConnectionMapping, modelName, "model_class_events", eventName)

    if (existingConnection) {
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
    existingConnection = dig(this.subscriptionDataToConnectionMapping, modelName, "updates", modelId)

    if(existingConnection){
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

    this.updateSubscriptionDataToConnectionMapping(cableSubscriptionPool)

    return cableSubscriptionPool
  }

  scheduleConnectUpcoming() {
    if (this.scheduleConnectUpcomingTimeout)
      clearTimeout(this.scheduleConnectUpcomingTimeout)

    this.scheduleConnectUpcomingTimeout = setTimeout(() => this.connectUpcoming(), 50)
  }

  updateSubscriptionDataToConnectionMapping(cableSubscriptionPool) {
    for(const modelName in subscriptions) {
      if (subscriptions[modelName]["creates"]) {
        this.addConnectCreatedToConnectionMapping(cableSubscriptionPool)
      }

      if (subscriptions[modelName]["events"]) {
        for(const eventName in subscriptions[modelName]["events"]) {
          for(const modelId in subscriptions[modelName]["events"][eventName]) {
            this.addConnectDestroyedToConnectionMapping(modelName, modelId, cableSubscriptionPool)
          }
        }
      }

      if (subscriptions[modelName]["updates"]) {
        addConnectUpdatedToConnectionMapping(modelName, modelId, cableSubscriptionPool)
      }
    }
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

  addConnectEventToConnectionMapping(modelName, modelId, eventName, subscriptionConnection) {
    if (!this.subscriptionDataToConnectionMapping[modelName])
      this.subscriptionDataToConnectionMapping[modelName] = {}

    if (!this.subscriptionDataToConnectionMapping[modelName]["events"])
      this.subscriptionDataToConnectionMapping[modelName]["events"] = {}

    if (!this.subscriptionDataToConnectionMapping[modelName]["events"][eventName])
      this.subscriptionDataToConnectionMapping[modelName]["events"][eventName] = {}

    this.subscriptionDataToConnectionMapping[modelName]["events"][eventName][modelId] = subscriptionConnection
  }

  addConnectUpdatedToConnectionMapping(modelName, modelId, subscriptionConnection) {
    if (!this.subscriptionDataToConnectionMapping[modelName]) {
      this.subscriptionDataToConnectionMapping[modelname] = {}
    }

    if (!this.subscriptionDataToConnectionMapping[modelName]["updates"]) {
      this.subscriptionDataToConnectionMapping[modelName]["updates"] = {}
    }

    this.subscriptionDataToConnectionMapping[modelName]["updates"][modelId] = subscriptionConnection
  }
}
