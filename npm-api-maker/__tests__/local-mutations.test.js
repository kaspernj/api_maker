// @ts-check
import LocalMutations from "../src/local-mutations.js"
import {jest} from "@jest/globals"

describe("LocalMutations", () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  describe("consume", () => {
    it("returns false when nothing was recorded for that model", () => {
      const localMutations = new LocalMutations()

      expect(localMutations.consume("Contact", 1, "updates")).toEqual(false)
    })

    it("consumes only the first broadcast after a recorded mutation", () => {
      const localMutations = new LocalMutations()

      localMutations.record("Contact", 1, "updates")

      expect(localMutations.consume("Contact", 1, "updates")).toEqual(true)
      expect(localMutations.consume("Contact", 1, "updates")).toEqual(false)
    })

    it("does not consume a broadcast for another mutation kind", () => {
      const localMutations = new LocalMutations()

      localMutations.record("Contact", 1, "updates")

      expect(localMutations.consume("Contact", 1, "destroys")).toEqual(false)
    })

    it("does not consume a broadcast for another model", () => {
      const localMutations = new LocalMutations()

      localMutations.record("Contact", 1, "updates")

      expect(localMutations.consume("Contact", 2, "updates")).toEqual(false)
      expect(localMutations.consume("Company", 1, "updates")).toEqual(false)
    })

    it("does not consume a broadcast when the mutation was recorded before the echo window", () => {
      jest.useFakeTimers()

      const localMutations = new LocalMutations()

      localMutations.record("Contact", 1, "updates")
      jest.advanceTimersByTime(1001)

      expect(localMutations.consume("Contact", 1, "updates")).toEqual(false)
    })
  })

  describe("current", () => {
    it("shares one registry so the connection pool and the subscription pool agree on what was delivered locally", () => {
      const localMutations = LocalMutations.current()

      localMutations.record("Contact", 1, "updates")

      expect(LocalMutations.current()).toBe(localMutations)
      expect(LocalMutations.current().consume("Contact", 1, "updates")).toEqual(true)
    })
  })

  describe("resetCurrent", () => {
    it("drops recorded mutations", () => {
      LocalMutations.current().record("Contact", 1, "updates")
      LocalMutations.resetCurrent()

      expect(LocalMutations.current().consume("Contact", 1, "updates")).toEqual(false)
    })
  })
})
