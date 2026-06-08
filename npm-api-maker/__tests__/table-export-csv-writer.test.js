// @ts-check
import CsvWriter from "../src/table/export/format-writers/csv-writer.js"

describe("ApiMakerTableExportCsvWriter", () => {
  it("writes a header with a UTF-8 BOM and CRLF line break", () => {
    const writer = new CsvWriter()

    expect(writer.header(["a", "b"])).toBe("﻿a,b\r\n")
  })

  it("escapes quotes, commas and newlines per RFC 4180", () => {
    const writer = new CsvWriter()

    expect(writer.row(["he said \"hi\"", "a,b", "line1\nline2", "plain"]))
      .toBe("\"he said \"\"hi\"\"\",\"a,b\",\"line1\nline2\",plain\r\n")
  })

  it("renders null and undefined as empty fields and keeps falsy values", () => {
    const writer = new CsvWriter()

    expect(writer.row([null, undefined, 0, false])).toBe(",,0,false\r\n")
  })

  it("has an empty footer", () => {
    expect(new CsvWriter().footer()).toBe("")
  })
})
