import Serializer from "../src/serializer.mjs"
import User from "./support/user.mjs"

describe("Serializer", () => {
  test("it serializes model classes", () => {
    const testObject = {
      userModel: User
    }
    const serialized = Serializer.serialize(testObject)

    expect(serialized).toEqual({userModel: {api_maker_type: "resource", name: "User"}})
  })

  test("it serializes dates", () => {
    // Mock time zone offset
    var getTimezoneOffset = Date.prototype.getTimezoneOffset

    Date.prototype.getTimezoneOffset = function () {
      return -120
    }

    const date = new Date(1985, 5, 17, 10, 30, 5)
    const serialized = Serializer.serialize(date)

    // Restore time zone offset
    Date.prototype.getTimezoneOffset = getTimezoneOffset

    expect(serialized).toEqual({api_maker_type: "datetime", value: "1985-6-17 10:30:5+0200"})
  })
})
