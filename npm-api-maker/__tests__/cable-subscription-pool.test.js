// @ts-check
import CableSubscription from "../src/cable-subscription.js"
import CableSubscriptionPool from "../src/cable-subscription-pool.js"
import LocalMutations from "../src/local-mutations.js"
import {jest} from "@jest/globals"

describe("CableSubscriptionPool", () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  describe("onUnsubscribe", () => {
    it("unsubscribes from ActionCable", () => {
      const cableSubscriptionPool = new CableSubscriptionPool()

      let unsubscribeCalled = false

      cableSubscriptionPool.activeSubscriptions = 1
      cableSubscriptionPool.subscription = {
        unsubscribe: () => {
          unsubscribeCalled = true
        }
      }
      cableSubscriptionPool.onUnsubscribe()

      expect(unsubscribeCalled).toEqual(true)
      expect(cableSubscriptionPool.activeSubscriptions).toEqual(0)
      expect(cableSubscriptionPool.isConnected()).toEqual(false)
    })
  })

  describe("onReceived", () => {
    afterEach(() => {
      LocalMutations.resetCurrent()
    })

    it("drops the update broadcast that echoes a mutation this client already delivered", () => {
      const cableSubscriptionPool = new CableSubscriptionPool()
      const received = jest.fn()
      const subscription = new CableSubscription()

      cableSubscriptionPool.subscriptions = {Contact: {updates: {1: [subscription]}}}
      subscription.events.addListener("received", received)
      LocalMutations.current().record("Contact", 1, "updates")

      cableSubscriptionPool.onReceived({mi: 1, mt: "contacts", t: "u"})

      expect(received).not.toHaveBeenCalled()
    })

    it("delivers an update broadcast that this client did not perform", () => {
      const cableSubscriptionPool = new CableSubscriptionPool()
      const received = jest.fn()
      const subscription = new CableSubscription()

      cableSubscriptionPool.subscriptions = {Contact: {updates: {1: [subscription]}}}
      subscription.events.addListener("received", received)

      cableSubscriptionPool.onReceived({mi: 1, mt: "contacts", t: "u"})

      expect(received).toHaveBeenCalledTimes(1)
    })

    it("delivers the update broadcast that follows the echo of this client's own mutation", () => {
      const cableSubscriptionPool = new CableSubscriptionPool()
      const received = jest.fn()
      const subscription = new CableSubscription()

      cableSubscriptionPool.subscriptions = {Contact: {updates: {1: [subscription]}}}
      subscription.events.addListener("received", received)
      LocalMutations.current().record("Contact", 1, "updates")

      cableSubscriptionPool.onReceived({mi: 1, mt: "contacts", t: "u"})
      cableSubscriptionPool.onReceived({mi: 1, mt: "contacts", t: "u"})

      expect(received).toHaveBeenCalledTimes(1)
    })

    it("drops the destroy broadcast that echoes a mutation this client already delivered", () => {
      const cableSubscriptionPool = new CableSubscriptionPool()
      const received = jest.fn()
      const subscription = new CableSubscription()

      cableSubscriptionPool.subscriptions = {Contact: {destroys: {1: [subscription]}}}
      subscription.events.addListener("received", received)
      LocalMutations.current().record("Contact", 1, "destroys")

      cableSubscriptionPool.onReceived({mi: 1, mt: "contacts", t: "d"})

      expect(received).not.toHaveBeenCalled()
    })

    it("drops the create broadcast that echoes a create this client already delivered", () => {
      const cableSubscriptionPool = new CableSubscriptionPool()
      const received = jest.fn()
      const subscription = new CableSubscription()

      cableSubscriptionPool.subscriptions = {Contact: {creates: [subscription]}}
      subscription.events.addListener("received", received)
      LocalMutations.current().record("Contact", 1, "creates")

      cableSubscriptionPool.onReceived({mi: 1, mt: "contacts", t: "c"})

      expect(received).not.toHaveBeenCalled()
    })
  })

  describe("refreshAuthentication", () => {
    it("performs a refresh action and resolves when the server acknowledges it", async() => {
      const cableSubscriptionPool = new CableSubscriptionPool()
      const perform = jest.fn()

      cableSubscriptionPool.connected = true
      cableSubscriptionPool.subscription = {perform}

      const promise = cableSubscriptionPool.refreshAuthentication({scope: "user", signedIn: true})

      expect(perform).toHaveBeenCalledWith("refresh_auth", {scope: "user", signedIn: true})

      cableSubscriptionPool.onReceived({type: "api_maker_subscription_auth_refreshed"})

      await expect(promise).resolves.toBeUndefined()
    })

    it("rejects when the server reports an auth refresh failure", async() => {
      const cableSubscriptionPool = new CableSubscriptionPool()

      cableSubscriptionPool.connected = true
      cableSubscriptionPool.subscription = {perform: jest.fn()}

      const promise = cableSubscriptionPool.refreshAuthentication({scope: "user", signedIn: false})

      cableSubscriptionPool.onReceived({
        error: {message: "No session"},
        type: "api_maker_subscription_auth_refresh_error"
      })

      await expect(promise).rejects.toThrow("No session")
    })

    it("rejects when the auth refresh acknowledgement never arrives", async() => {
      jest.useFakeTimers()
      const cableSubscriptionPool = new CableSubscriptionPool()

      cableSubscriptionPool.connected = true
      cableSubscriptionPool.subscription = {perform: jest.fn()}

      const promise = cableSubscriptionPool.refreshAuthentication({scope: "user", signedIn: false})

      jest.advanceTimersByTime(5000)

      await expect(promise).rejects.toThrow("Subscription auth refresh timed out")
    })

    it("rejects when the websocket disconnects before the auth refresh completes", async() => {
      const cableSubscriptionPool = new CableSubscriptionPool()

      cableSubscriptionPool.connected = true
      cableSubscriptionPool.subscription = {perform: jest.fn()}

      const promise = cableSubscriptionPool.refreshAuthentication({scope: "user", signedIn: false})

      cableSubscriptionPool.onDisconnected()

      await expect(promise).rejects.toThrow("Subscription auth refresh was interrupted by a disconnect")
      expect(cableSubscriptionPool.isConnected()).toEqual(false)
    })

    it("skips future auth refreshes after the websocket disconnects", async() => {
      const cableSubscriptionPool = new CableSubscriptionPool()

      cableSubscriptionPool.connected = true
      cableSubscriptionPool.subscription = {perform: jest.fn()}
      cableSubscriptionPool.onDisconnected()

      await expect(cableSubscriptionPool.refreshAuthentication({scope: "user", signedIn: false})).resolves.toBeUndefined()
      expect(cableSubscriptionPool.subscription.perform).not.toHaveBeenCalled()
    })

    it("allows auth refreshes again after the websocket reconnects", async() => {
      const cableSubscriptionPool = new CableSubscriptionPool()
      const perform = jest.fn()

      cableSubscriptionPool.connected = true
      cableSubscriptionPool.subscription = {perform}
      cableSubscriptionPool.subscriptions = {}
      cableSubscriptionPool.onDisconnected()
      cableSubscriptionPool.onConnected()

      const promise = cableSubscriptionPool.refreshAuthentication({scope: "user", signedIn: false})

      expect(perform).toHaveBeenCalledWith("refresh_auth", {scope: "user", signedIn: false})

      cableSubscriptionPool.onReceived({type: "api_maker_subscription_auth_refreshed"})

      await expect(promise).resolves.toBeUndefined()
      expect(cableSubscriptionPool.isConnected()).toEqual(true)
    })
  })

  describe("reset", () => {
    it("disconnects the subscription and rejects pending auth refresh callbacks", async() => {
      const cableSubscriptionPool = new CableSubscriptionPool()
      const unsubscribe = jest.fn()

      cableSubscriptionPool.connected = true
      cableSubscriptionPool.subscription = {perform: jest.fn(), unsubscribe}

      const promise = cableSubscriptionPool.refreshAuthentication({scope: "user", signedIn: false})

      cableSubscriptionPool.reset()
      cableSubscriptionPool.onDisconnected()

      await expect(promise).rejects.toThrow("Subscription pool was reset")
      expect(unsubscribe).toHaveBeenCalledTimes(1)
      expect(cableSubscriptionPool.isConnected()).toEqual(false)
    })

    it("ignores later unsubscribe callbacks from wrappers that outlive the pool reset", () => {
      const cableSubscriptionPool = new CableSubscriptionPool()
      const unsubscribe = jest.fn()

      cableSubscriptionPool.activeSubscriptions = 1
      cableSubscriptionPool.connected = true
      cableSubscriptionPool.subscription = {unsubscribe}

      cableSubscriptionPool.reset()
      cableSubscriptionPool.onUnsubscribe()

      expect(unsubscribe).toHaveBeenCalledTimes(1)
      expect(cableSubscriptionPool.activeSubscriptions).toEqual(0)
    })
  })
})
