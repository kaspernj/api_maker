import {jest} from "@jest/globals"

jest.unstable_mockModule("on-location-changed/build/use-query-params.js", () => ({
  default: () => undefined
}))

jest.unstable_mockModule("../src/use-shape.js", () => ({
  default: () => ({})
}))

jest.unstable_mockModule("../src/use-created-event.js", () => ({
  default: () => {}
}))

const {queryParamsOrEmpty} = await import("../src/use-collection.js")

describe("useCollection", () => {
  it("treats missing query params as an empty hash", () => {
    expect(queryParamsOrEmpty(undefined)).toEqual({})
  })

  it("returns the given query params when present", () => {
    const queryParams = {school_classes_q: "{\"foo\":\"bar\"}"}

    expect(queryParamsOrEmpty(queryParams)).toBe(queryParams)
  })
})
