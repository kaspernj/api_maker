import resetRealtimeRuntimeState, {waitForRealtimeRuntimeIdleAndReset} from "../src/reset-realtime-runtime-state.js"
import ApiMakerCableConnectionPool from "../src/cable-connection-pool.js"
import ApiMakerWebsocketRequestClient from "../src/websocket-request-client.js"
import {jest} from "@jest/globals"

describe("resetRealtimeRuntimeState", () => {
  afterEach(() => {
    jest.restoreAllMocks()
    delete globalThis.apiMakerChannelsConsumer
  })

  it("waits for websocket requests to go idle before resetting the realtime runtime", async() => {
    const waitForIdle = jest.fn().mockResolvedValue(undefined)

    jest.spyOn(ApiMakerWebsocketRequestClient, "current").mockReturnValue({waitForIdle})
    jest.spyOn(ApiMakerWebsocketRequestClient, "resetCurrent").mockImplementation(() => {})
    jest.spyOn(ApiMakerCableConnectionPool, "resetCurrent").mockImplementation(() => {})
    globalThis.apiMakerChannelsConsumer = {disconnect: jest.fn()}

    await waitForRealtimeRuntimeIdleAndReset({timeoutMs: 123})

    expect(waitForIdle).toHaveBeenCalledWith({timeoutMs: 123})
    expect(ApiMakerWebsocketRequestClient.resetCurrent).toHaveBeenCalledTimes(1)
    expect(ApiMakerCableConnectionPool.resetCurrent).toHaveBeenCalledTimes(1)
    expect(globalThis.apiMakerChannelsConsumer).toBeUndefined()
  })

  it("resets the realtime runtime immediately for synchronous callers", () => {
    jest.spyOn(ApiMakerWebsocketRequestClient, "resetCurrent").mockImplementation(() => {})
    jest.spyOn(ApiMakerCableConnectionPool, "resetCurrent").mockImplementation(() => {})
    globalThis.apiMakerChannelsConsumer = {disconnect: jest.fn()}

    resetRealtimeRuntimeState()

    expect(ApiMakerWebsocketRequestClient.resetCurrent).toHaveBeenCalledTimes(1)
    expect(ApiMakerCableConnectionPool.resetCurrent).toHaveBeenCalledTimes(1)
    expect(globalThis.apiMakerChannelsConsumer).toBeUndefined()
  })
})
