import Serializer from "../src/serializer"
import User from "./support/user"

describe("Serializer", () => {
  test("it serializes model classes", () => {
    const testObject = {
      userModel: User
    }
    const serialized = Serializer.serialize(testObject)

    expect(serialized).toEqual({userModel: {api_maker_type: "resource", name: "User"}})
  })
})
