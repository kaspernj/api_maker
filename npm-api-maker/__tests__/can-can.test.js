import CanCan from "../src/can-can"
import {jest} from "@jest/globals"
import Services from "../src/services"

jest.mock("../build/services.js")

describe("CanCan", () => {
  const canCan = CanCan.current()

  describe("resetAbilities", () => {
    test("that reset abilities and load abilities not have concurrency issues", async () => {
      const mockedCurrent = jest.fn().mockReturnValue({
        sendRequest: async () => ({abilities: ["loaded"]})
      })
      Services.current = mockedCurrent

      const loadAbilitiesPromise = canCan.loadAbilities([["user", ["read"]]])
      const resetPromise = canCan.resetAbilities()

      await Promise.all([loadAbilitiesPromise, resetPromise])

      expect(canCan.abilities).toEqual([])
    })

    it("dispatches an event", async () => {
      const eventListener = jest.fn()
      canCan.events.addListener("onResetAbilities", eventListener)

      await canCan.resetAbilities()

      expect(eventListener).toHaveBeenCalled()
    })
  })
})
