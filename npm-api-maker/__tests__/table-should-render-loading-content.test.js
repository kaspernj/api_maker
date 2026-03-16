import shouldRenderLoadingContent from "../src/table/should-render-loading-content.js"


describe("shouldRenderLoadingContent", () => {
  it("returns false when models, query, and result are loaded", () => {
    expect(
      shouldRenderLoadingContent({
        models: [],
        query: {},
        result: {}
      })
    ).toBe(false)
  })

  it("returns true when query is still loading", () => {
    expect(
      shouldRenderLoadingContent({
        models: [],
        query: undefined,
        result: {}
      })
    ).toBe(true)
  })

  it("returns true when result is still loading", () => {
    expect(
      shouldRenderLoadingContent({
        models: [],
        query: {},
        result: undefined
      })
    ).toBe(true)
  })

  it("returns true while collection data is still loading", () => {
    expect(
      shouldRenderLoadingContent({
        models: undefined,
        query: undefined,
        result: undefined
      })
    ).toBe(true)
  })
})
