const canCan = require("../src/can-can.cjs")

jest.mock("../src/services.cjs")

describe("CanCan", () => {
  describe("resetAbilities", () => {
    it("that reset abilities and load abilities not have concurrency issues", async () => {
      const Services = require("../src/services.cjs")
      const mockedCurrent = jest.fn().mockReturnValue({
        sendRequest: async () => ({abilities: ["loaded"]})
      })
      Services.current = mockedCurrent

      const loadAbilitiesPromise = canCan.current().loadAbilities([["user", ["read"]]])
      canCan.current().resetAbilities()

      // await the abilities promise to make sure the lock has not been removed from the methods
      await loadAbilitiesPromise

      expect(canCan.current().abilities).toEqual([])
    })

    it("dispatches an event", async () => {
      const eventListener = jest.fn()
      canCan.current().abilities = ["bogus"]
      canCan.current().events.addListener("onResetAbilities", eventListener)

      await canCan.current().resetAbilities()

      expect(eventListener).toHaveBeenCalled()
    })
  })
})
