import {merge} from "../src/merge.mjs"

describe("merge", () => {
  it("merges an empty object and changes nothing", () => {
    const object = {
      firstName: "Kasper",
      age: 35
    }

    merge(object, {})

    expect(object).toEqual({
      firstName: "Kasper",
      age: 35
    })
  })

  it("merges an empty object into a nested object", () => {
    const object = {ransack: {account_id_eq: 1}}

    merge(object, {})

    expect(object).toEqual({ransack: {account_id_eq: 1}})
  })
})
