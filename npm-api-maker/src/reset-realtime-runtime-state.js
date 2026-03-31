import ApiMakerCableConnectionPool from "./cable-connection-pool.js"
import ApiMakerWebsocketRequestClient from "./websocket-request-client.js"
import {resetChannelsConsumer} from "./channels-consumer.js"

/** @returns {void} */
const resetRealtimeRuntimeState = () => {
  ApiMakerWebsocketRequestClient.resetCurrent()
  ApiMakerCableConnectionPool.resetCurrent()
  resetChannelsConsumer()
}

/**
 * Waits for websocket-backed Api Maker requests to complete before resetting the realtime runtime.
 *
 * @param {object} [args]
 * @param {number} [args.timeoutMs]
 * @returns {Promise<void>}
 */
const waitForRealtimeRuntimeIdleAndReset = async({timeoutMs = 5000} = {}) => {
  await ApiMakerWebsocketRequestClient.current().waitForIdle({timeoutMs})
  resetRealtimeRuntimeState()
}

export {waitForRealtimeRuntimeIdleAndReset}
export default resetRealtimeRuntimeState
