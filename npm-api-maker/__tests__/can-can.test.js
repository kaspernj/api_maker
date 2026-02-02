import CanCan from "../src/can-can.js"
import Services from "../src/services.js"
import {jest} from "@jest/globals"

describe("CanCan", () => {
  let canCan

  const flushPromises = () => Promise.resolve()

  beforeEach(() => {
    canCan = new CanCan()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe("resetAbilities", () => {
    test("that reset abilities and load abilities not have concurrency issues", async() => {
      jest.spyOn(Services, "current").mockReturnValue({
        sendRequest: async() => ({abilities: ["loaded"]})
      })

      const loadAbilitiesPromise = canCan.loadAbilities([["user", ["read"]]])
      const resetPromise = canCan.resetAbilities()

      await Promise.all([loadAbilitiesPromise, resetPromise])

      expect(canCan.abilities).toEqual([])
    })

    it("dispatches an event", async() => {
      const eventListener = jest.fn()
      canCan.events.addListener("onResetAbilities", eventListener)

      await canCan.resetAbilities()

      expect(eventListener).toHaveBeenCalled()
    })

    it("dedupes concurrent resets", async() => {
      const eventListener = jest.fn()
      canCan.events.addListener("onResetAbilities", eventListener)

      const resetPromise = canCan.resetAbilities()
      const resetPromiseTwo = canCan.resetAbilities()

      await Promise.all([resetPromise, resetPromiseTwo])

      expect(canCan.abilitiesGeneration).toBe(1)
      expect(eventListener).toHaveBeenCalledTimes(1)
    })
  })

  describe("loadAbilities", () => {
    it("keeps reloading state until all loads finish", async() => {
      jest.useFakeTimers()

      let resolveRequest
      const requestPromise = new Promise((resolve) => {
        resolveRequest = resolve
      })

      jest.spyOn(Services, "current").mockReturnValue({
        sendRequest: () => requestPromise
      })

      const loadPromise = canCan.loadAbilities([["user", ["read"]]])
      const loadPromiseTwo = canCan.loadAbilities([["user", ["read"]]])

      jest.runOnlyPendingTimers()

      expect(canCan.isReloading()).toBe(true)

      resolveRequest({abilities: []})

      await flushPromises()
      await Promise.all([loadPromise, loadPromiseTwo])

      expect(canCan.isReloading()).toBe(false)
    })

    it("resolves waiters even when requests fail", async() => {
      jest.useFakeTimers()

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})

      jest.spyOn(Services, "current").mockReturnValue({
        sendRequest: async() => {
          throw new Error("Boom")
        }
      })

      const loadPromise = canCan.loadAbilities([["user", ["read"]]])

      jest.runOnlyPendingTimers()

      await flushPromises()
      await loadPromise

      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe("reloadAbilities", () => {
    it("dedupes reloads for the same key", async() => {
      jest.useFakeTimers()

      jest.spyOn(Services, "current").mockReturnValue({
        sendRequest: async() => ({abilities: []})
      })

      const resetSpy = jest.spyOn(canCan, "resetAbilities")

      const reloadPromise = canCan.reloadAbilities([["user", ["read"]]], "same-key")
      const reloadPromiseTwo = canCan.reloadAbilities([["user", ["read"]]], "same-key")

      jest.runOnlyPendingTimers()

      await Promise.all([reloadPromise, reloadPromiseTwo])

      expect(resetSpy).toHaveBeenCalledTimes(1)
    })
  })
})
