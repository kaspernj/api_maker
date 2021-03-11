const CableConnectionPool = require("../src/cable-connection-pool.cjs")
const {digg} = require("@kaspernj/object-digger")

describe("CableConnectionPool", () => {
  it("creates a new create event and connects", () => {
    const cableConnectionPool = new CableConnectionPool()

    cableConnectionPool.scheduleConnectUpcoming = function () {
      const subscriptionData = this.upcomingSubscriptionData
      const subscriptions = this.upcomingSubscriptions

      this.upcomingSubscriptionData = {}
      this.upcomingSubscriptions = {}

      const cableSubscriptionPool = {props: {subscriptionData, subscriptions}}

      this.cableSubscriptionPools.push(cableSubscriptionPool)
    }
    cableConnectionPool.cableSubscriptionPools = []
    cableConnectionPool.connectCreated("Contact", () => console.log("Callback"))

    expect(cableConnectionPool.cableSubscriptionPools.length).toEqual(1)

    const newCableSubscriptionPool = digg(cableConnectionPool, "cableSubscriptionPools", 0)
    const subscriptions = digg(newCableSubscriptionPool, "props", "subscriptions", "Contact", "creates")

    expect(subscriptions.length).toEqual(1)
  })

  it("creates a new update event and connects", () => {
    const cableConnectionPool = new CableConnectionPool()
    const fakeCableSubscriptionPool = {
      props: {
        subscriptions: {
          Contact: {
            destroys: {
              modelId: []
            }
          }
        }
      }
    }

    cableConnectionPool.scheduleConnectUpcoming = function () {
      const subscriptionData = this.upcomingSubscriptionData
      const subscriptions = this.upcomingSubscriptions

      this.upcomingSubscriptionData = {}
      this.upcomingSubscriptions = {}

      const cableSubscriptionPool = {props: {subscriptionData, subscriptions}}

      this.cableSubscriptionPools.push(cableSubscriptionPool)
    }
    cableConnectionPool.cableSubscriptionPools = [fakeCableSubscriptionPool]
    cableConnectionPool.connectModelEvent({path: ["Contact", "updates"], value: "modelId"})

    expect(cableConnectionPool.cableSubscriptionPools.length).toEqual(2)

    const newCableSubscriptionPool = cableConnectionPool.cableSubscriptionPools[1]
    const subscriptions = digg(newCableSubscriptionPool, "props", "subscriptions", "Contact", "updates", "modelId")

    expect(subscriptions.length).toEqual(1)
  })

  it("connects to an existing update event", () => {
    let connectedUnsubscribeEvent = false

    const cableConnectionPool = new CableConnectionPool()
    const fakeCableSubscriptionPool = {
      connectUnsubscriptionForSubscription: function() {
        connectedUnsubscribeEvent = true
      },
      props: {
        subscriptions: {
          Contact: {
            updates: {
              modelId: []
            }
          }
        }
      }
    }

    cableConnectionPool.connectUpcoming = () => console.log("connectUpcoming")
    cableConnectionPool.cableSubscriptionPools = [fakeCableSubscriptionPool]
    cableConnectionPool.connectModelEvent({path: ["Contact", "updates"], value: "modelId"})

    const subscriptions = digg(fakeCableSubscriptionPool, "props", "subscriptions", "Contact", "updates", "modelId")

    expect(subscriptions.length).toEqual(1)
    expect(connectedUnsubscribeEvent).toEqual(true)
  })
})
