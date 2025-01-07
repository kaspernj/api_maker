import CustomError from "../build/custom-error"

describe("CustomError", () => {
  it("handles when response is a string", () => {
    const xhr = {status: 401}
    const response = "An error happened"
    const customError = new CustomError(`Request failed with code: ${xhr.status}`, {response, xhr})

    expect(customError.message).toEqual("Request failed with code: 401")
    expect(customError.errorMessages()).toEqual(undefined)
    expect(customError.errorTypes()).toEqual(undefined)
  })
})
