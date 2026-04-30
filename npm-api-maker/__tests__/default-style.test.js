// @ts-check
import {computeSlotStylesList} from "../src/utils/default-style.jsx"

describe("computeSlotStylesList", () => {
  it("returns an empty list when both inputs are absent", () => {
    expect(computeSlotStylesList(undefined, undefined)).toEqual([])
  })

  it("treats a missing slot default as empty so unregistered slots work", () => {
    expect(computeSlotStylesList(undefined, {color: "red"})).toEqual([{color: "red"}])
  })

  it("appends caller style after an array slot default", () => {
    const slotDefault = [{color: "red"}, {fontSize: 14}]
    const result = computeSlotStylesList(slotDefault, {fontWeight: 700})

    expect(result).toEqual([{color: "red"}, {fontSize: 14}, {fontWeight: 700}])
  })

  it("normalizes an object slot default to an array", () => {
    expect(computeSlotStylesList({color: "red"}, {fontWeight: 700}))
      .toEqual([{color: "red"}, {fontWeight: 700}])
  })

  it("flattens an array caller style", () => {
    const result = computeSlotStylesList(
      [{color: "red"}],
      [{fontSize: 14}, {fontWeight: 700}]
    )

    expect(result).toEqual([{color: "red"}, {fontSize: 14}, {fontWeight: 700}])
  })

  it("does not mutate the original slot default array", () => {
    const slotDefault = [{color: "red"}]

    computeSlotStylesList(slotDefault, {fontWeight: 700})

    expect(slotDefault).toEqual([{color: "red"}])
  })
})
