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
      canCan.resetAbilities()

      // await the abilities promise to make sure the lock has not been removed from the methods
      await loadAbilitiesPromise

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
