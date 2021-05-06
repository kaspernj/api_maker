const canCan = require("../src/can-can.cjs")

jest.mock("../src/services.cjs")

describe("CanCan", () => {
  test("that reset abilities and load abilities not have concurrency issues", async() => {
    const Services = require("../src/services.cjs")
    const mockedCurrent = jest.fn().mockReturnValue({
      sendRequest: async() => ({abilities: ["loaded"]})
    })
    Services.current = mockedCurrent

    const loadAbilitiesPromise = canCan.current().loadAbilities([["user", ["read"]]])
    canCan.current().resetAbilities()

    // await the abilities promise to make sure the lock has not been removed from the methods
    await loadAbilitiesPromise

    expect(canCan.current().abilities).toEqual([])
  })
})
