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
      request,
      request_id: 1
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

  it("resets the subscription state after disconnects", () => {
    client.onDisconnected()

    expect(client.subscription).toBeNull()
    expect(client.subscriptionState).toBe("disconnected")
  })
})
