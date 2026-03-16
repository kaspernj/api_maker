import shouldRenderLoadingContent from "../src/table/should-render-loading-content.js"


describe("shouldRenderLoadingContent", () => {
  it("returns false when no-records-available content is shown", () => {
    expect(
      shouldRenderLoadingContent({
        models: [],
        query: {},
        result: {},
        showNoRecordsAvailableContent: true,
        showNoRecordsFoundContent: false
      })
    ).toBe(false)
  })

  it("returns false when no-records-found content is shown", () => {
    expect(
      shouldRenderLoadingContent({
        models: [],
        query: {},
        result: {},
        showNoRecordsAvailableContent: false,
        showNoRecordsFoundContent: true
      })
    ).toBe(false)
  })

  it("returns false when models, query, and result are loaded", () => {
    expect(
      shouldRenderLoadingContent({
        models: [],
        query: {},
        result: {},
        showNoRecordsAvailableContent: false,
        showNoRecordsFoundContent: false
      })
    ).toBe(false)
  })

  it("returns true while collection data is still loading", () => {
    expect(
      shouldRenderLoadingContent({
        models: undefined,
        query: undefined,
        result: undefined,
        showNoRecordsAvailableContent: false,
        showNoRecordsFoundContent: false
      })
    ).toBe(true)
  })
})
