import CanCan from "../src/can-can.js"
import Services from "../src/services.js"
import {jest} from "@jest/globals"

describe("CanCan", () => {
  let canCan

  const flushPromises = async () => {
    await Promise.resolve()
    await Promise.resolve()
  }

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

      await jest.runAllTimersAsync()

      expect(canCan.isReloading()).toBe(true)

      resolveRequest({abilities: []})

      await flushPromises()
      await Promise.all([loadPromise, loadPromiseTwo])

      expect(canCan.isReloading()).toBe(false)
    })

    it("resolves waiters even when requests fail", async() => {
      jest.useFakeTimers()

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})
      const reportAsyncErrorSpy = jest.spyOn(canCan, "reportUnhandledAsyncError").mockImplementation(() => {})

      jest.spyOn(Services, "current").mockReturnValue({
        sendRequest: async() => {
          throw new Error("Boom")
        }
      })

      const loadPromise = canCan.loadAbilities([["user", ["read"]]])

      await jest.runAllTimersAsync()

      await flushPromises()
      await loadPromise

      expect(consoleSpy).toHaveBeenCalled()
      expect(reportAsyncErrorSpy).toHaveBeenCalledTimes(1)
      expect(reportAsyncErrorSpy.mock.calls[0][0].message).toEqual("Boom")
    })

    it("loads abilities by normalized string subject names", async() => {
      jest.useFakeTimers()

      jest.spyOn(Services, "current").mockReturnValue({
        sendRequest: async() => ({
          abilities: [{ability: "read", can: true, subject: "Account"}]
        })
      })

      const loadPromise = canCan.loadAbilities([["Account", ["read"]]])
      await jest.runAllTimersAsync()
      await loadPromise

      expect(canCan.can("read", "Account")).toBe(true)
    })

    it("loads abilities across model class references with the same model name", async() => {
      jest.useFakeTimers()

      class AccountRefOne {
        static modelClassData() {
          return {name: "Account"}
        }
      }
      class AccountRefTwo {
        static modelClassData() {
          return {name: "Account"}
        }
      }

      jest.spyOn(Services, "current").mockReturnValue({
        sendRequest: async() => ({
          abilities: [{ability: "read", can: true, subject: AccountRefOne}]
        })
      })

      const loadPromise = canCan.loadAbilities([[AccountRefTwo, ["read"]]])
      await jest.runAllTimersAsync()
      await loadPromise

      expect(canCan.can("read", AccountRefTwo)).toBe(true)
    })

    it("requeues stale generation callbacks after generation mismatch", async() => {
      const callback = jest.fn()
      const loadAbilitySpy = jest.spyOn(canCan, "loadAbility").mockResolvedValue()

      canCan.abilitiesToLoad = [{ability: "read", callbacks: [callback], subject: "user"}]
      canCan.abilitiesToLoadData = [{ability: "read", subject: "user"}]

      jest.spyOn(Services, "current").mockReturnValue({
        sendRequest: async() => {
          canCan.abilitiesGeneration += 1
          return {abilities: []}
        }
      })

      await canCan.sendAbilitiesRequest()
      await flushPromises()

      expect(loadAbilitySpy).toHaveBeenCalledWith("read", "user")
      expect(callback).toHaveBeenCalledTimes(1)
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

      await jest.runAllTimersAsync()

      await Promise.all([reloadPromise, reloadPromiseTwo])

      expect(resetSpy).toHaveBeenCalledTimes(1)
    })
  })
})
