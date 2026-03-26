import CableSubscriptionPool from "../src/cable-subscription-pool.js"
import {jest} from "@jest/globals"

describe("CableSubscriptionPool", () => {
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
  })
})
