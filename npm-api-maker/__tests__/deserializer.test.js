import Deserializer from "../build/deserializer"

describe("Deserializer", () => {
  test("it deserializes datetimes", () => {
    const deserialized = Deserializer.parse({api_maker_type: "datetime", value: "1985-6-17 10:30:5+0200"})

    expect(deserialized).toBeInstanceOf(Date)
    expect(deserialized.apiMakerType).toEqual("datetime")
    expect(deserialized.toISOString()).toEqual("1985-06-17T08:30:05.000Z")
  })
})
