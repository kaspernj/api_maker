const CanCan = require("../src/can-can.cjs")

jest.mock("../src/services.cjs")

describe("CanCan", () => {
  const canCan = CanCan.current()

  describe("resetAbilities", () => {
    test("that reset abilities and load abilities not have concurrency issues", async () => {
      const Services = require("../src/services.cjs")
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
