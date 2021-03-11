const CableConnectionPool = require("../src/cable-connection-pool.cjs")
const {digg} = require("@kaspernj/object-digger")

describe("CableConnectionPool", () => {
  it("creates a new event and connects", () => {
    let connectedUnsubscribeEvent = false

    const cableConnectionPool = new CableConnectionPool()
    const fakeCableSubscriptionPool = {
      connectUnsubscriptionForSubscription: function() {
        connectedUnsubscribeEvent = true
      },
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
      console.log("Mocked connectUpcoming called")

      const subscriptionData = this.upcomingSubscriptionData
      const subscriptions = this.upcomingSubscriptions

      this.upcomingSubscriptionData = {}
      this.upcomingSubscriptions = {}

      const cableSubscriptionPool = {subscriptionData, subscriptions}

      this.cableSubscriptionPools.push(cableSubscriptionPool)
    }
    cableConnectionPool.cableSubscriptionPools = [fakeCableSubscriptionPool]
    cableConnectionPool.connectModelEvent({path: ["Contact", "updates", "modelId"]})

    expect(cableConnectionPool.cableSubscriptionPools.length).toEqual(2)

    const newCableSubscriptionPool = cableConnectionPool.cableSubscriptionPools[1]
    const subscriptions = digg(newCableSubscriptionPool, "props", "subscriptions", "Contact", "updates", "modelId")

    expect(subscriptions.length).toEqual(1)
    expect(connectedUnsubscribeEvent).toEqual(true)
  })

  it("connects to an existing event", () => {
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
    cableConnectionPool.connectModelEvent({path: ["Contact", "updates", "modelId"]})

    const subscriptions = digg(fakeCableSubscriptionPool, "props", "subscriptions", "Contact", "updates", "modelId")

    expect(subscriptions.length).toEqual(1)
    expect(connectedUnsubscribeEvent).toEqual(true)
  })
})
