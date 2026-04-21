// @ts-check
import {dig} from "diggerize"
import CableSubscriptionClass from "./cable-subscription.js" // eslint-disable-line sort-imports
import CableSubscriptionPool from "./cable-subscription-pool.js"
import RunLast from "./run-last.js"

const shared = {}

/** @typedef {import("./cable-subscription.js").default} CableSubscription */
/** @typedef {import("./base-model.js").default} BaseModel */
/** @typedef {object | string | number | boolean | null | Array<object | string | number | boolean | null>} CableRequestValue */
/** @typedef {Record<string, CableRequestValue>} CableRefreshArgs */
/** @typedef {string | number | boolean} ConnectionEventValue */
/** @typedef {string[]} ModelSubscriptionPath */
/** @typedef {{model: BaseModel}} ModelMutationPayload */
/** @typedef {Record<string, string | number | boolean | null | Array<string | number | boolean | null>>} CableEventArgs */
/** @typedef {{args: CableEventArgs, eventName: string, model: BaseModel}} ModelEventPayload */
/** @typedef {{args: CableEventArgs, eventName: string}} ModelClassEventPayload */
/** @typedef {(payload: ModelMutationPayload | ModelEventPayload | ModelClassEventPayload) => void} ModelEventCallback */

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
   * @param {ModelSubscriptionPath} root0.path
   * @param {CableSubscription} root0.subscription
   * @param {ConnectionEventValue} root0.value
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
   * @param {ModelEventCallback} root0.callback
   * @param {ModelSubscriptionPath} root0.path
   * @param {ConnectionEventValue} root0.value
   * @returns {CableSubscription}
   */
  connectModelEvent ({callback, path, value}) {
    const subscription = new CableSubscriptionClass()

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
      const subscriptionKey = String(value)

      if (!(subscriptionKey in currentSubscription)) {
        currentSubscription[subscriptionKey] = []
      }

      currentSubscription[subscriptionKey].push(subscription)
    }

    this.scheduleConnectUpcomingRunLast.queue()

    return subscription
  }

  /**
   * Subscribes to created events for a model class.
   * @param {string} modelName
   * @param {(payload: ModelMutationPayload) => void} callback
   * @returns {CableSubscription}
   */
  connectCreated = (modelName, callback) => this.connectModelEvent({callback, value: true, path: [modelName, "creates"]})

  /**
   * Subscribes to a named event for one persisted model instance.
   * @param {string} modelName
   * @param {string | number} modelId
   * @param {string} eventName
   * @param {(payload: ModelEventPayload) => void} callback
   * @returns {CableSubscription}
   */
  connectEvent = (modelName, modelId, eventName, callback) => this.connectModelEvent({ // eslint-disable-line max-params
    callback,
    value: modelId,
    path: [modelName, "events", eventName]
  })

  /**
   * Subscribes to destroy events for one persisted model instance.
   * @param {string} modelName
   * @param {string | number} modelId
   * @param {(payload: ModelMutationPayload) => void} callback
   * @returns {CableSubscription}
   */
  connectDestroyed = (modelName, modelId, callback) => this.connectModelEvent({callback, value: modelId, path: [modelName, "destroys"]})

  /**
   * Subscribes to one named model-class event stream.
   * @param {string} modelName
   * @param {string} eventName
   * @param {(payload: ModelClassEventPayload) => void} callback
   * @returns {CableSubscription}
   */
  connectModelClassEvent = (modelName, eventName, callback) => this.connectModelEvent({callback, value: eventName, path: [modelName, "model_class_events"]})

  /**
   * Subscribes to update events for one persisted model instance.
   * @param {string} modelName
   * @param {string | number} modelId
   * @param {(payload: ModelMutationPayload) => void} callback
   * @returns {CableSubscription}
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
   * @param {CableRefreshArgs} args
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
