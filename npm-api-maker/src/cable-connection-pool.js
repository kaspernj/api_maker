// @ts-check
import {dig} from "diggerize"
import CableSubscription from "./cable-subscription.js" // eslint-disable-line sort-imports
import CableSubscriptionPool from "./cable-subscription-pool.js"
import RunLast from "./run-last.js"

const shared = {}

/** ActionCable connection pool keyed by stream identifiers. */
export default class ApiMakerCableConnectionPool {
  cableSubscriptionPools = []
  connections = {}
  upcomingSubscriptionData = {}
  upcomingSubscriptions = {}

  /**
   * Returns the shared connection pool instance.
   * @returns {ApiMakerCableConnectionPool}
   */
  static current () {
    if (!shared.apiMakerCableConnectionPool) shared.apiMakerCableConnectionPool = new ApiMakerCableConnectionPool()

    return shared.apiMakerCableConnectionPool
  }

  /** @returns {void} */
  static resetCurrent () {
    if (!shared.apiMakerCableConnectionPool) {
      return
    }

    shared.apiMakerCableConnectionPool.reset()
    delete shared.apiMakerCableConnectionPool
  }

  /**
   * Attaches a logical subscription to an already-open shared ActionCable stream when possible.
   * @param {object} root0
   * @param {any} root0.path
   * @param {any} root0.subscription
   * @param {any} root0.value
   * @returns {boolean}
   */
  connectEventToExistingSubscription ({path, subscription, value}) {
    for (const cableSubscriptionPool of this.cableSubscriptionPools) {
      if (cableSubscriptionPool.isConnected()) {
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
          subscription.events.emit("connected")

          return true
        }
      }
    }

    return false
  }

  /**
   * Registers one logical model subscription, reusing an existing shared connection when available.
   * @param {object} root0
   * @param {any} root0.callback
   * @param {any} root0.path
   * @param {any} root0.value
   * @returns {any}
   */
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

  /**
   * Subscribes to created events for a model class.
   * @param {any} modelName
   * @param {any} callback
   * @returns {any}
   */
  connectCreated = (modelName, callback) => this.connectModelEvent({callback, value: true, path: [modelName, "creates"]})

  /**
   * Subscribes to a named event for one persisted model instance.
   * @param {any} modelName
   * @param {any} modelId
   * @param {any} eventName
   * @param {any} callback
   * @returns {any}
   */
  connectEvent = (modelName, modelId, eventName, callback) => this.connectModelEvent({ // eslint-disable-line max-params
    callback,
    value: modelId,
    path: [modelName, "events", eventName]
  })

  /**
   * Subscribes to destroy events for one persisted model instance.
   * @param {any} modelName
   * @param {any} modelId
   * @param {any} callback
   * @returns {any}
   */
  connectDestroyed = (modelName, modelId, callback) => this.connectModelEvent({callback, value: modelId, path: [modelName, "destroys"]})

  /**
   * Subscribes to one named model-class event stream.
   * @param {any} modelName
   * @param {any} eventName
   * @param {any} callback
   * @returns {any}
   */
  connectModelClassEvent = (modelName, eventName, callback) => this.connectModelEvent({callback, value: eventName, path: [modelName, "model_class_events"]})

  /**
   * Subscribes to update events for one persisted model instance.
   * @param {any} modelName
   * @param {any} modelId
   * @param {any} callback
   * @returns {any}
   */
  connectUpdate = (modelName, modelId, callback) => this.connectModelEvent({callback, value: modelId, path: [modelName, "updates"]})

  /** Opens one shared ActionCable subscription for all queued logical subscriptions. */
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

  /**
   * Refreshes auth across the existing subscription pools.
   *
   * @param {Record<string, any>} args
   * @returns {Promise<void>}
   */
  async refreshAuthentication (args) {
    await Promise.all(
      this.cableSubscriptionPools.map((cableSubscriptionPool) => cableSubscriptionPool.refreshAuthentication(args))
    )
  }

  /** @returns {void} */
  reset () {
    this.scheduleConnectUpcomingRunLast.clearTimeout()

    this.cableSubscriptionPools.forEach((cableSubscriptionPool) => {
      cableSubscriptionPool.reset()
    })

    this.cableSubscriptionPools = []
    this.connections = {}
    this.upcomingSubscriptionData = {}
    this.upcomingSubscriptions = {}
  }

  scheduleConnectUpcomingRunLast = new RunLast(this.connectUpcoming)
}
