import CustomError from "./custom-error.js"
import Logger from "./logger.js"
import channelsConsumer from "./channels-consumer.js"

const logger = new Logger({name: "ApiMaker / WebsocketRequestClient"})
const shared = {}

/** Shared websocket request client for ApiMaker command/service execution. */
export default class ApiMakerWebsocketRequestClient {
  /** @returns {ApiMakerWebsocketRequestClient} */
  static current () {
    if (!shared.currentApiMakerWebsocketRequestClient) {
      shared.currentApiMakerWebsocketRequestClient = new ApiMakerWebsocketRequestClient()
    }

    return shared.currentApiMakerWebsocketRequestClient
  }

  /** Constructor. */
  constructor () {
    this.currentRequestId = 1
    this.pendingRequests = {}
    this.pendingRequestsByFingerprint = {}
    this.responseCache = {}
    this.subscriptionState = "new"
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
        fingerprint,
        onLogCallbacks: onLog ? [onLog] : [],
        onProgressCallbacks: onProgress ? [onProgress] : [],
        onReceivedCallbacks: onReceived ? [onReceived] : [],
        reject,
        resolve
      }

      this.waitForSubscription().then(() => {
        this.ensureSubscription().perform("execute", {
          cache_response: cacheResponse,
          global,
          request,
          request_id: requestId
        })
      })
        .catch((error) => {
          delete this.pendingRequests[requestId]
          reject(error)
        })
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

  /** @returns {void} */
  onConnected = () => {
    logger.debug("Websocket request subscription connected")
    this.subscriptionState = "connected"
    this.resolveSubscriptionReadyPromise?.()
  }

  /** @returns {void} */
  onDisconnected = () => {
    logger.debug("Websocket request subscription disconnected")
    this.rejectPendingRequests(new Error("Websocket request subscription disconnected"))
    this.subscriptionState = "disconnected"
    this.subscription = null
    this.resetSubscriptionReadyPromise()
  }

  /** @returns {void} */
  onRejected = () => {
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
      pendingRequest.onReceivedCallbacks.forEach((callback) => callback(data))
    } else if (data.type == "api_maker_request_response") {
      delete this.pendingRequests[data.request_id]

      if (pendingRequest.cacheResponse) {
        this.responseCache[pendingRequest.fingerprint] = data.response
      }

      pendingRequest.resolve(data.response)
    } else if (data.type == "api_maker_request_error") {
      delete this.pendingRequests[data.request_id]
      pendingRequest.reject(new CustomError("Websocket request failed", {response: data.response}))
    } else {
      delete this.pendingRequests[data.request_id]
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

    Object.values(pendingRequests).forEach((pendingRequest) => {
      queueMicrotask(() => pendingRequest.reject(error))
    })
  }
}
