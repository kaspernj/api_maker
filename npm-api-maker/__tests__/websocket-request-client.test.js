import ApiMakerWebsocketRequestClient from "../src/websocket-request-client.js"
import {jest} from "@jest/globals"

describe("ApiMakerWebsocketRequestClient", () => {
  let client

  beforeEach(() => {
    client = new ApiMakerWebsocketRequestClient()
    client.subscription = {perform: jest.fn()}
    client.subscriptionState = "connected"
  })

  it("dedupes concurrent requests with the same fingerprint", async() => {
    const request = {pool: {service: {calls: {services: {1: {args: {}, id: 1}}}}}}
    const promiseOne = client.perform({global: {layout: "user"}, request})
    const promiseTwo = client.perform({global: {layout: "user"}, request})

    await Promise.resolve()

    expect(client.subscription.perform).toHaveBeenCalledTimes(1)
    expect(promiseOne).toBe(promiseTwo)

    client.onReceived({
      request_id: 1,
      response: {responses: {1: {data: {ok: true}, type: "success"}}},
      type: "api_maker_request_response"
    })

    await expect(promiseOne).resolves.toEqual({
      responses: {1: {data: {ok: true}, type: "success"}}
    })
  })

  it("reuses cached responses when cacheResponse is enabled", async() => {
    const request = {pool: {service: {calls: {services: {1: {args: {}, id: 1}}}}}}
    const promise = client.perform({
      cacheResponse: true,
      global: {layout: "user"},
      request
    })

    await Promise.resolve()

    client.onReceived({
      request_id: 1,
      response: {responses: {1: {data: {cached: true}, type: "success"}}},
      type: "api_maker_request_response"
    })

    await expect(promise).resolves.toEqual({
      responses: {1: {data: {cached: true}, type: "success"}}
    })

    const cachedResponse = await client.perform({
      cacheResponse: true,
      global: {layout: "user"},
      request
    })

    expect(client.subscription.perform).toHaveBeenCalledTimes(1)
    expect(cachedResponse).toEqual({
      responses: {1: {data: {cached: true}, type: "success"}}
    })
  })

  it("waits for the subscription to connect before performing requests", async() => {
    client.subscriptionState = "connecting"
    client.resetSubscriptionReadyPromise()

    const request = {pool: {service: {calls: {services: {1: {args: {}, id: 1}}}}}}
    const promise = client.perform({global: {layout: "user"}, request})

    expect(client.subscription.perform).not.toHaveBeenCalled()

    client.onConnected()

    await Promise.resolve()

    expect(client.subscription.perform).toHaveBeenCalledWith("execute", {
      cache_response: undefined,
      global: {layout: "user"},
      last_command_event_sequence: 0,
      request,
      request_id: 1,
      request_uid: expect.any(String)
    })

    client.onReceived({
      request_id: 1,
      response: {responses: {1: {data: {ok: true}, type: "success"}}},
      type: "api_maker_request_response"
    })

    await expect(promise).resolves.toEqual({
      responses: {1: {data: {ok: true}, type: "success"}}
    })
  })

  it("emits received, progress, and log callbacks before the final response", async() => {
    const onLog = jest.fn()
    const onProgress = jest.fn()
    const onReceived = jest.fn()
    const request = {pool: {service: {calls: {services: {1: {args: {}, id: 1}}}}}}
    const promise = client.perform({global: {layout: "user"}, onLog, onProgress, onReceived, request})

    client.onReceived({
      request_id: 1,
      type: "api_maker_request_received"
    })
    client.onReceived({
      count: 2,
      progress: 0.5,
      request_id: 1,
      total: 4,
      type: "api_maker_command_progress"
    })
    client.onReceived({
      message: "Calculating stuff",
      request_id: 1,
      type: "api_maker_command_log"
    })
    client.onReceived({
      request_id: 1,
      response: {responses: {1: {data: {ok: true}, type: "success"}}},
      type: "api_maker_request_response"
    })

    await expect(promise).resolves.toEqual({
      responses: {1: {data: {ok: true}, type: "success"}}
    })
    expect(onReceived).toHaveBeenCalledWith({request_id: 1, type: "api_maker_request_received"})
    expect(onProgress).toHaveBeenCalledWith({count: 2, progress: 0.5, total: 4})
    expect(onLog).toHaveBeenCalledWith("Calculating stuff")
  })

  it("resets the subscription state after disconnects", async() => {
    const nextSubscription = {perform: jest.fn()}
    jest.spyOn(client, "ensureSubscription").mockImplementation(() => {
      client.subscription = nextSubscription
      client.subscriptionState = "connecting"
      return nextSubscription
    })

    const promise = client.perform({global: {layout: "user"}, request: {pool: {}}})

    client.onDisconnected()

    expect(client.ensureSubscription).toHaveBeenCalled()
    expect(client.subscription).toBe(nextSubscription)
    expect(client.subscriptionState).toBe("connecting")

    client.onConnected()
    await Promise.resolve()

    expect(nextSubscription.perform).toHaveBeenCalledWith("execute", {
      cache_response: undefined,
      global: {layout: "user"},
      last_command_event_sequence: 0,
      request: {pool: {}},
      request_id: 1,
      request_uid: expect.any(String)
    })

    client.onReceived({
      request_id: 1,
      response: {responses: {1: {data: {ok: true}, type: "success"}}},
      type: "api_maker_request_response"
    })

    await expect(promise).resolves.toEqual({
      responses: {1: {data: {ok: true}, type: "success"}}
    })
  })

  it("sends the latest received command event sequence when reconnecting", async() => {
    const nextSubscription = {perform: jest.fn()}

    jest.spyOn(client, "ensureSubscription").mockImplementation(() => {
      client.subscription = nextSubscription
      client.subscriptionState = "connecting"
      return nextSubscription
    })

    const promise = client.perform({global: {layout: "user"}, request: {pool: {}}})

    client.onReceived({
      command_event_sequence: 4,
      count: 2,
      progress: 0.5,
      request_id: 1,
      total: 4,
      type: "api_maker_command_progress"
    })
    client.onDisconnected()
    client.onConnected()
    await Promise.resolve()

    expect(nextSubscription.perform).toHaveBeenCalledWith("execute", {
      cache_response: undefined,
      global: {layout: "user"},
      last_command_event_sequence: 4,
      request: {pool: {}},
      request_id: 1,
      request_uid: expect.any(String)
    })

    client.onReceived({
      request_id: 1,
      response: {responses: {1: {data: {ok: true}, type: "success"}}},
      type: "api_maker_request_response"
    })

    await expect(promise).resolves.toEqual({
      responses: {1: {data: {ok: true}, type: "success"}}
    })
  })

  it("resets pending requests and clears the singleton client", async() => {
    const singletonClient = ApiMakerWebsocketRequestClient.current()

    singletonClient.subscription = {unsubscribe: jest.fn()}
    singletonClient.subscriptionState = "connected"
    const promise = singletonClient.perform({global: {layout: "user"}, request: {pool: {}}})

    ApiMakerWebsocketRequestClient.resetCurrent()

    expect(singletonClient.subscription).toBeNull()
    expect(singletonClient.subscriptionState).toBe("new")
    await expect(promise).rejects.toThrow("Websocket request client reset")
    expect(ApiMakerWebsocketRequestClient.current()).not.toBe(singletonClient)
  })

  it("ignores delayed disconnect callbacks after reset", () => {
    const singletonClient = ApiMakerWebsocketRequestClient.current()
    const ensureSubscription = jest.spyOn(singletonClient, "ensureSubscription")

    ApiMakerWebsocketRequestClient.resetCurrent()
    singletonClient.onDisconnected()

    expect(ensureSubscription).not.toHaveBeenCalled()
    expect(singletonClient.subscription).toBeNull()
  })
})
