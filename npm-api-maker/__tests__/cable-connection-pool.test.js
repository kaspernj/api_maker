import CableConnectionPool from "../buikd/cable-connection-pool.js"
import CableSubscriptionPool from "../build/cable-subscription-pool"
import {digg} from "diggerize"
import {jest} from "@jest/globals"

jest.mock("@rails/actioncable", () => ({
  createConsumer: () => ({})
}))

describe("CableConnectionPool", () => {
  describe("connectCreated", () => {
    it("creates a new create event and connects", () => {
      const cableConnectionPool = new CableConnectionPool()

      cableConnectionPool.scheduleConnectUpcoming = function() {
        const subscriptionData = this.upcomingSubscriptionData
        const subscriptions = this.upcomingSubscriptions

        this.upcomingSubscriptionData = {}
        this.upcomingSubscriptions = {}

        const cableSubscriptionPool = {subscriptionData, subscriptions}

        this.cableSubscriptionPools.push(cableSubscriptionPool)
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

      cableConnectionPool.scheduleConnectUpcoming = function() {
        const subscriptionData = this.upcomingSubscriptionData
        const subscriptions = this.upcomingSubscriptions

        this.upcomingSubscriptionData = {}
        this.upcomingSubscriptions = {}

        const cableSubscriptionPool = {subscriptionData, subscriptions}

        this.cableSubscriptionPools.push(cableSubscriptionPool)
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

        const cableSubscriptionPool = {subscriptionData, subscriptions}

        this.cableSubscriptionPools.push(cableSubscriptionPool)
      }
      cableConnectionPool.cableSubscriptionPools = [cableSubscriptionPool]
      cableConnectionPool.scheduleConnectUpcoming = () => cableConnectionPool.connectUpcoming()
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

      cableConnectionPool.scheduleConnectUpcoming = function() {
        const subscriptionData = this.upcomingSubscriptionData
        const subscriptions = this.upcomingSubscriptions

        this.upcomingSubscriptionData = {}
        this.upcomingSubscriptions = {}

        const cableSubscriptionPool = {subscriptionData, subscriptions}

        this.cableSubscriptionPools.push(cableSubscriptionPool)
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
})
