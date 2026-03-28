import CableConnectionPool from "../src/cable-connection-pool.js"
import CableSubscriptionPool from "../src/cable-subscription-pool.js"
import {digg} from "diggerize"
import {jest} from "@jest/globals"

describe("CableConnectionPool", () => {
  describe("connectCreated", () => {
    it("creates a new create event and connects", () => {
      const cableConnectionPool = new CableConnectionPool()

      cableConnectionPool.scheduleConnectUpcomingRunLast.queue = () => {
        const subscriptionData = cableConnectionPool.upcomingSubscriptionData
        const subscriptions = cableConnectionPool.upcomingSubscriptions

        cableConnectionPool.upcomingSubscriptionData = {}
        cableConnectionPool.upcomingSubscriptions = {}

        const cableSubscriptionPool = {subscriptionData, subscriptions}

        cableConnectionPool.cableSubscriptionPools.push(cableSubscriptionPool)
      }
      cableConnectionPool.cableSubscriptionPools = []
      cableConnectionPool.connectCreated("Contact", () => console.log("Callback"))

      expect(cableConnectionPool.cableSubscriptionPools.length).toEqual(1)

      const newCableSubscriptionPool = digg(cableConnectionPool, "cableSubscriptionPools", 0)
      const subscriptions = digg(newCableSubscriptionPool, "subscriptions", "Contact", "creates")

      expect(subscriptions.length).toEqual(1)
    })
  })

  describe("connectDestroyed", () => {
    it("creates a new destroy event and connects", () => {
      const cableConnectionPool = new CableConnectionPool()
      const cableSubscriptionPool = new CableSubscriptionPool()

      cableSubscriptionPool.subscriptions = {
        Contact: {
          updates: {
            modelId: []
          }
        }
      }

      cableConnectionPool.scheduleConnectUpcomingRunLast.queue = () => {
        const subscriptionData = cableConnectionPool.upcomingSubscriptionData
        const subscriptions = cableConnectionPool.upcomingSubscriptions

        cableConnectionPool.upcomingSubscriptionData = {}
        cableConnectionPool.upcomingSubscriptions = {}

        const nextCableSubscriptionPool = {subscriptionData, subscriptions}

        cableConnectionPool.cableSubscriptionPools.push(nextCableSubscriptionPool)
      }
      cableConnectionPool.cableSubscriptionPools = [cableSubscriptionPool]
      cableConnectionPool.connectDestroyed("Contact", "modelId", () => { })

      expect(cableConnectionPool.cableSubscriptionPools.length).toEqual(2)

      const newCableSubscriptionPool = cableConnectionPool.cableSubscriptionPools[1]
      const subscriptions = digg(newCableSubscriptionPool, "subscriptions", "Contact", "destroys", "modelId")

      expect(subscriptions.length).toEqual(1)
    })

    it("connects to an existing destroy event", () => {
      let connectedUnsubscribeEvent = false

      const cableConnectionPool = new CableConnectionPool()
      const cableSubscriptionPool = new CableSubscriptionPool()

      cableSubscriptionPool.connected = true
      cableSubscriptionPool.connectUnsubscriptionForSubscription = function() {
        connectedUnsubscribeEvent = true
      }
      cableSubscriptionPool.subscriptions = {
        Contact: {
          destroys: {
            modelId: []
          }
        }
      }

      cableConnectionPool.connectUpcoming = () => console.log("connectUpcoming")
      cableConnectionPool.cableSubscriptionPools = [cableSubscriptionPool]
      cableConnectionPool.connectDestroyed("Contact", "modelId", () => { })

      const subscriptions = digg(cableSubscriptionPool, "subscriptions", "Contact", "destroys", "modelId")

      expect(subscriptions.length).toEqual(1)
      expect(connectedUnsubscribeEvent).toEqual(true)
    })

    it("doesnt connect to an existing destroy event that is disconnected", () => {
      const cableConnectionPool = new CableConnectionPool()
      const cableSubscriptionPool = new CableSubscriptionPool()

      cableSubscriptionPool.subscriptions = {
        Contact: {
          destroys: {
            modelId: []
          }
        }
      }

      cableConnectionPool.connected = false
      cableConnectionPool.connectUpcoming = function() {
        const subscriptionData = this.upcomingSubscriptionData
        const subscriptions = this.upcomingSubscriptions

        this.upcomingSubscriptionData = {}
        this.upcomingSubscriptions = {}

        const nextCableSubscriptionPool = {subscriptionData, subscriptions}

        this.cableSubscriptionPools.push(nextCableSubscriptionPool)
      }
      cableConnectionPool.cableSubscriptionPools = [cableSubscriptionPool]
      cableConnectionPool.scheduleConnectUpcomingRunLast.queue = () => cableConnectionPool.connectUpcoming()
      cableConnectionPool.connectDestroyed("Contact", "modelId", () => { })

      const subscriptions = digg(cableSubscriptionPool, "subscriptions", "Contact", "destroys", "modelId")

      expect(subscriptions.length).toEqual(0)
      expect(cableConnectionPool.cableSubscriptionPools.length).toEqual(2)
    })
  })

  describe("connectUpdate", () => {
    it("creates a new update event and connects", () => {
      const cableConnectionPool = new CableConnectionPool()
      const cableSubscriptionPool = new CableSubscriptionPool()

      cableSubscriptionPool.subscriptions = {
        Contact: {
          destroys: {
            modelId: []
          }
        }
      }

      cableConnectionPool.scheduleConnectUpcomingRunLast.queue = () => {
        const subscriptionData = cableConnectionPool.upcomingSubscriptionData
        const subscriptions = cableConnectionPool.upcomingSubscriptions

        cableConnectionPool.upcomingSubscriptionData = {}
        cableConnectionPool.upcomingSubscriptions = {}

        const nextCableSubscriptionPool = {subscriptionData, subscriptions}

        cableConnectionPool.cableSubscriptionPools.push(nextCableSubscriptionPool)
      }
      cableConnectionPool.cableSubscriptionPools = [cableSubscriptionPool]
      cableConnectionPool.connectUpdate("Contact", "modelId", () => console.log("Update callback"))

      expect(cableConnectionPool.cableSubscriptionPools.length).toEqual(2)

      const newCableSubscriptionPool = cableConnectionPool.cableSubscriptionPools[1]
      const subscriptions = digg(newCableSubscriptionPool, "subscriptions", "Contact", "updates", "modelId")

      expect(subscriptions.length).toEqual(1)
    })

    it("connects to an existing update event", () => {
      let connectedUnsubscribeEvent = false

      const cableConnectionPool = new CableConnectionPool()
      const cableSubscriptionPool = new CableSubscriptionPool()

      cableSubscriptionPool.connected = true
      cableSubscriptionPool.connectUnsubscriptionForSubscription = function() {
        connectedUnsubscribeEvent = true
      }
      cableSubscriptionPool.subscriptions = {
        Contact: {
          updates: {
            modelId: []
          }
        }
      }

      cableConnectionPool.connectUpcoming = () => console.log("connectUpcoming")
      cableConnectionPool.cableSubscriptionPools = [cableSubscriptionPool]
      cableConnectionPool.connectUpdate("Contact", "modelId", () => { })

      const subscriptions = digg(cableSubscriptionPool, "subscriptions", "Contact", "updates", "modelId")

      expect(subscriptions.length).toEqual(1)
      expect(connectedUnsubscribeEvent).toEqual(true)
    })

    it("connects to an existing update event if the model ID is truthy like 1 is", () => {
      let connectedUnsubscribeEvent = false

      const cableConnectionPool = new CableConnectionPool()
      const cableSubscriptionPool = new CableSubscriptionPool()

      cableSubscriptionPool.connected = true
      cableSubscriptionPool.connectUnsubscriptionForSubscription = function() {
        connectedUnsubscribeEvent = true
      }
      cableSubscriptionPool.subscriptions = {
        Contact: {
          updates: {
            1: []
          }
        }
      }

      cableConnectionPool.connectUpcoming = () => console.log("connectUpcoming")
      cableConnectionPool.cableSubscriptionPools = [cableSubscriptionPool]
      cableConnectionPool.connectUpdate("Contact", 1, () => console.log("Update callback called"))

      const subscriptions = digg(cableSubscriptionPool, "subscriptions", "Contact", "updates", 1)

      expect(subscriptions.length).toEqual(1)
      expect(connectedUnsubscribeEvent).toEqual(true)
    })
  })

  describe("refreshAuthentication", () => {
    it("only refreshes pools that are still connected", async() => {
      const cableConnectionPool = new CableConnectionPool()
      const disconnectedPool = new CableSubscriptionPool()
      const connectedPool = new CableSubscriptionPool()
      const connectedRefresh = jest.fn(() => Promise.resolve())

      disconnectedPool.connected = true
      disconnectedPool.subscription = {perform: jest.fn()}
      disconnectedPool.onDisconnected()
      connectedPool.connected = true
      connectedPool.refreshAuthentication = connectedRefresh
      cableConnectionPool.cableSubscriptionPools = [disconnectedPool, connectedPool]

      await cableConnectionPool.refreshAuthentication({scope: "user", signedIn: false})

      expect(disconnectedPool.subscription.perform).not.toHaveBeenCalled()
      expect(connectedRefresh).toHaveBeenCalledWith({scope: "user", signedIn: false})
    })
  })

  describe("reset", () => {
    it("resets existing pools and clears queued subscriptions", () => {
      const cableConnectionPool = new CableConnectionPool()
      const reset = jest.fn()
      const clearTimeout = jest.fn()

      cableConnectionPool.cableSubscriptionPools = [{reset}]
      cableConnectionPool.connections = {Contact: true}
      cableConnectionPool.upcomingSubscriptionData = {Contact: {updates: ["1"]}}
      cableConnectionPool.upcomingSubscriptions = {Contact: {updates: {1: []}}}
      cableConnectionPool.scheduleConnectUpcomingRunLast = {clearTimeout}

      cableConnectionPool.reset()

      expect(clearTimeout).toHaveBeenCalledTimes(1)
      expect(reset).toHaveBeenCalledTimes(1)
      expect(cableConnectionPool).toMatchObject({
        cableSubscriptionPools: [],
        connections: {},
        upcomingSubscriptionData: {},
        upcomingSubscriptions: {}
      })
    })
  })
})
