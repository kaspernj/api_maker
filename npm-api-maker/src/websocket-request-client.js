import CustomError from "./custom-error.js"
import Logger from "./logger.js"
import channelsConsumer from "./channels-consumer.js"

const logger = new Logger({name: "ApiMaker / WebsocketRequestClient"})
const shared = {}

/** Shared websocket request client for ApiMaker command/service execution. */
export default class ApiMakerWebsocketRequestClient {
  idleWaiters = []

  /** @returns {ApiMakerWebsocketRequestClient} */
  static current () {
    if (!shared.currentApiMakerWebsocketRequestClient) {
      shared.currentApiMakerWebsocketRequestClient = new ApiMakerWebsocketRequestClient()
    }

    return shared.currentApiMakerWebsocketRequestClient
  }

  /** @returns {void} */
  static resetCurrent () {
    if (!shared.currentApiMakerWebsocketRequestClient) {
      return
    }

    shared.currentApiMakerWebsocketRequestClient.reset()
    delete shared.currentApiMakerWebsocketRequestClient
  }

  /** Constructor. */
  constructor () {
    this.currentRequestId = 1
    this.skipReconnect = false
    this.pendingRequests = {}
    this.pendingRequestsByFingerprint = {}
    this.responseCache = {}
    this.subscriptionState = "new"
  }

  /** @returns {number} */
  pendingRequestsCount () {
    return Object.keys(this.pendingRequests).length
  }

  /**
   * Waits for all in-flight websocket requests to complete.
   *
   * @param {object} [args]
   * @param {number} [args.timeoutMs]
   * @returns {Promise<void>}
   */
  waitForIdle ({timeoutMs = 5000} = {}) {
    if (this.pendingRequestsCount() == 0) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.idleWaiters = this.idleWaiters.filter((idleWaiter) => idleWaiter.reject != reject)
        reject(new Error(`Timed out while waiting for websocket requests to finish. Pending requests: ${this.pendingRequestsCount()}`))
      }, timeoutMs)

      this.idleWaiters.push({
        reject,
        resolve: () => {
          clearTimeout(timeout)
          resolve()
        }
      })
    })
  }

  /**
   * @param {object} args
   * @param {boolean} [args.cacheResponse]
   * @param {Record<string, any>} [args.global]
   * @param {(value: string) => void} [args.onLog]
   * @param {(value: Record<string, any>) => void} [args.onProgress]
   * @param {(value: Record<string, any>) => void} [args.onReceived]
   * @param {Record<string, any>} args.request
   * @returns {Promise<Record<string, any>>}
   */
  perform ({cacheResponse, global, onLog, onProgress, onReceived, request}) {
    const fingerprint = JSON.stringify({global, request})

    if (cacheResponse && this.responseCache[fingerprint]) {
      return Promise.resolve(this.responseCache[fingerprint])
    }

    if (this.pendingRequestsByFingerprint[fingerprint]) {
      const pendingRequestData = this.pendingRequestsByFingerprint[fingerprint]
      const pendingRequest = this.pendingRequests[pendingRequestData.requestId]

      if (onLog) pendingRequest?.onLogCallbacks.push(onLog)
      if (onProgress) pendingRequest?.onProgressCallbacks.push(onProgress)
      if (onReceived) pendingRequest?.onReceivedCallbacks.push(onReceived)

      return pendingRequestData.promise
    }

    const promise = new Promise((resolve, reject) => {
      const requestId = this.currentRequestId
      this.currentRequestId += 1

      this.pendingRequests[requestId] = {
        cacheResponse,
        deliveryState: "queued",
        fingerprint,
        lastCommandEventSequence: 0,
        onLogCallbacks: onLog ? [onLog] : [],
        onProgressCallbacks: onProgress ? [onProgress] : [],
        onReceivedCallbacks: onReceived ? [onReceived] : [],
        global,
        request,
        requestUid: this.generateRequestUid(requestId),
        reject,
        resolve
      }

      this.sendPendingRequest(requestId)
    })

    this.pendingRequestsByFingerprint[fingerprint] = {promise, requestId: this.currentRequestId - 1}

    promise.then(() => {
      delete this.pendingRequestsByFingerprint[fingerprint]
    }, () => {
      delete this.pendingRequestsByFingerprint[fingerprint]
    })

    return promise
  }

  /** @returns {any} */
  ensureSubscription () {
    if (!this.subscription) {
      logger.debug("Creating websocket request subscription")
      this.subscriptionState = "connecting"
      this.resetSubscriptionReadyPromise()

      this.subscription = channelsConsumer().subscriptions.create(
        {channel: "ApiMaker::RequestsChannel"},
        {
          connected: this.onConnected,
          disconnected: this.onDisconnected,
          received: this.onReceived,
          rejected: this.onRejected
        }
      )
    }

    return this.subscription
  }

  /** @returns {Promise<void>} */
  waitForSubscription () {
    this.ensureSubscription()

    if (this.subscriptionState == "connected") {
      return Promise.resolve()
    }

    if (!this.subscriptionReadyPromise) {
      this.resetSubscriptionReadyPromise()
    }

    return this.subscriptionReadyPromise
  }

  /** @returns {void} */
  resetSubscriptionReadyPromise () {
    this.subscriptionReadyPromise = new Promise((resolve, reject) => {
      this.resolveSubscriptionReadyPromise = resolve
      this.rejectSubscriptionReadyPromise = reject
    })
  }

  /**
   * @param {number} requestId
   * @returns {string}
   */
  generateRequestUid (requestId) {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID()
    }

    return `api-maker-request-${Date.now()}-${requestId}`
  }

  /**
   * @param {number} requestId
   * @returns {void}
   */
  sendPendingRequest (requestId) {
    const pendingRequest = this.pendingRequests[requestId]

    if (!pendingRequest) {
      return
    }

    if (pendingRequest.deliveryState != "queued") {
      return
    }

    pendingRequest.deliveryState = "waiting_for_connection"

    this.waitForSubscription()
      .then(() => {
        const latestPendingRequest = this.pendingRequests[requestId]

        if (!latestPendingRequest) {
          return
        }

        if (latestPendingRequest.deliveryState != "waiting_for_connection") {
          return
        }

        latestPendingRequest.deliveryState = "sent"

        this.ensureSubscription().perform("execute", {
          cache_response: latestPendingRequest.cacheResponse,
          global: latestPendingRequest.global,
          last_command_event_sequence: latestPendingRequest.lastCommandEventSequence,
          request: latestPendingRequest.request,
          request_id: requestId,
          request_uid: latestPendingRequest.requestUid
        })
      })
      .catch((error) => {
        const latestPendingRequest = this.pendingRequests[requestId]

        if (!latestPendingRequest) {
          return
        }

        if (this.subscriptionState == "rejected") {
          delete this.pendingRequests[requestId]
          latestPendingRequest.reject(error)
          return
        }

        latestPendingRequest.deliveryState = "queued"
      })
  }

  /** @returns {void} */
  resendQueuedRequests () {
    Object.entries(this.pendingRequests).forEach(([requestId, pendingRequest]) => {
      if (pendingRequest.deliveryState == "queued") {
        this.sendPendingRequest(parseInt(requestId, 10))
      }
    })
  }

  /** @returns {void} */
  onConnected = () => {
    logger.debug("Websocket request subscription connected")
    this.subscriptionState = "connected"
    this.resolveSubscriptionReadyPromise?.()
    this.resendQueuedRequests()
  }

  /** @returns {void} */
  onDisconnected = () => {
    logger.debug("Websocket request subscription disconnected")
    this.subscription = null

    if (this.skipReconnect) {
      this.subscriptionState = "reset"
      return
    }

    Object.values(this.pendingRequests).forEach((pendingRequest) => {
      if (pendingRequest.deliveryState != "completed") {
        pendingRequest.deliveryState = "queued"
      }
    })

    this.subscriptionState = "disconnected"
    this.resetSubscriptionReadyPromise()
    this.ensureSubscription()
  }

  /** @returns {void} */
  onRejected = () => {
    if (this.skipReconnect) {
      this.subscriptionState = "reset"
      this.subscription = null
      return
    }

    const error = new Error("Websocket request subscription was rejected")

    logger.error(error)
    this.rejectPendingRequests(error)
    this.subscriptionState = "rejected"
    this.subscription = null
    this.rejectSubscriptionReadyPromise?.(error)
    this.resetSubscriptionReadyPromise()
  }

  /**
   * @param {Record<string, any>} data
   * @returns {void}
   */
  onReceived = (data) => {
    const pendingRequest = this.pendingRequests[data.request_id]

    if (!pendingRequest) {
      logger.debug(() => ["Ignoring websocket response without a pending request", {data}])
      return
    }

    if (data.command_event_sequence && data.command_event_sequence > pendingRequest.lastCommandEventSequence) {
      pendingRequest.lastCommandEventSequence = data.command_event_sequence
    }

    if (data.type == "api_maker_command_log") {
      pendingRequest.onLogCallbacks.forEach((callback) => callback(data.message))
    } else if (data.type == "api_maker_command_progress") {
      const progressData = {
        count: data.count,
        progress: data.progress,
        total: data.total
      }

      pendingRequest.onProgressCallbacks.forEach((callback) => callback(progressData))
    } else if (data.type == "api_maker_request_received") {
      pendingRequest.deliveryState = "received"
      pendingRequest.onReceivedCallbacks.forEach((callback) => callback(data))
    } else if (data.type == "api_maker_request_response") {
      delete this.pendingRequests[data.request_id]
      this.resolveIdleWaitersIfIdle()

      if (pendingRequest.cacheResponse) {
        this.responseCache[pendingRequest.fingerprint] = data.response
      }

      pendingRequest.resolve(data.response)
    } else if (data.type == "api_maker_request_error") {
      delete this.pendingRequests[data.request_id]
      this.resolveIdleWaitersIfIdle()
      pendingRequest.reject(new CustomError("Websocket request failed", {response: data.response}))
    } else {
      delete this.pendingRequests[data.request_id]
      this.resolveIdleWaitersIfIdle()
      pendingRequest.reject(new Error(`Unknown websocket request response type: ${data.type}`))
    }
  }

  /**
   * @param {Error} error
   * @returns {void}
   */
  rejectPendingRequests (error) {
    const pendingRequests = this.pendingRequests

    this.pendingRequests = {}
    this.pendingRequestsByFingerprint = {}
    this.resolveIdleWaitersIfIdle()

    Object.values(pendingRequests).forEach((pendingRequest) => {
      queueMicrotask(() => pendingRequest.reject(error))
    })
  }

  /** @returns {void} */
  resolveIdleWaitersIfIdle () {
    if (this.pendingRequestsCount() > 0 || this.idleWaiters.length == 0) {
      return
    }

    const idleWaiters = this.idleWaiters

    this.idleWaiters = []
    idleWaiters.forEach((idleWaiter) => idleWaiter.resolve())
  }

  /** @returns {void} */
  reset () {
    const resetError = new Error("Websocket request client was reset")

    this.skipReconnect = true
    this.rejectPendingRequests(resetError)
    this.responseCache = {}
    this.currentRequestId = 1
    this.rejectSubscriptionReadyPromise?.(resetError)

    if (this.subscription?.unsubscribe) {
      this.subscription.unsubscribe()
    }

    this.subscription = null
    this.subscriptionState = "new"
    this.resolveSubscriptionReadyPromise = undefined
    this.rejectSubscriptionReadyPromise = undefined
    this.subscriptionReadyPromise = undefined
  }
}
