const numberable = require("../index.cjs")

describe("numberable", () => {
  it("formats numbers with decimals, delimeter and separator", () => {
    const result = numberable(123456.12345, {delimiter: ",", precision: 2, separator: "."})

    expect(result).toEqual("123,456.12")
  })

  it("formats numbers where the whole number isn't dividable by three", () => {
    const result = numberable(12345.12345, {delimiter: ",", precision: 2, separator: "."})

    expect(result).toEqual("12,345.12")
  })

  it("appens zeros to decimals", () => {
    const result = numberable(12345.12, {delimiter: ",", precision: 4, separator: "."})

    expect(result).toEqual("12,345.1200")
  })
})
