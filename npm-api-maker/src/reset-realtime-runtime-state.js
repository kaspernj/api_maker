import ApiMakerCableConnectionPool from "./cable-connection-pool.js"
import ApiMakerWebsocketRequestClient from "./websocket-request-client.js"
import {resetChannelsConsumer} from "./channels-consumer.js"

/** @returns {void} */
export default function resetRealtimeRuntimeState() {
  ApiMakerWebsocketRequestClient.resetCurrent()
  ApiMakerCableConnectionPool.resetCurrent()
  resetChannelsConsumer()
}
