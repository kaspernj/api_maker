const CableSubscriptionPool = require("../src/cable-subscription-pool.cjs")

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
})
