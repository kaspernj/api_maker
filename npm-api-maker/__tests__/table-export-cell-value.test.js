// @ts-check
import {cellToHtml, cellToText} from "../src/table/export/cell-value.js"
import React from "react"

describe("table export cell value", () => {
  it("escapes plain string values for HTML", () => {
    expect(cellToHtml("a & <b>")).toBe("a &amp; &lt;b&gt;")
  })

  it("exports a React element cell's text (not [object Object]) for HTML", () => {
    const element = React.createElement("a", {href: "https://example.com"}, "Example & co")

    expect(cellToHtml(element)).toBe("Example &amp; co")
  })

  it("keeps plain values as text for CSV/Excel", () => {
    expect(cellToText("plain")).toBe("plain")
    expect(cellToText(null)).toBe("")
  })

  it("extracts nested React element text for CSV/Excel", () => {
    const element = React.createElement(
      "span",
      null,
      "Hello ",
      React.createElement("b", null, "world")
    )

    expect(cellToText(element)).toBe("Hello world")
  })
})
