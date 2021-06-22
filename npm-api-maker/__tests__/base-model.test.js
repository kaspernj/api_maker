const BaseModel = require("../src/base-model.cjs")
const CustomError = require("../src/custom-error.cjs")
const CustomValidationError = require("../src/custom-validation-error.cjs")

describe("BaseModel", () => {
  describe("update", () => {
    it("aborts if no changes", async () => {
      const model = new BaseModel()

      // This will fail because of missing setup if it doesn't abort.
      const response = await model.update({})

      // There will be extra objects in the hash if it actually calls the backend.
      expect(response).toEqual({model})
    })
  })

  describe("parseValidationErrors", () => {
    const error = new CustomError("Some validation error", {
      response: {
        validation_errors: []
      }
    })
    const form = document.createElement("form")
    const model = new BaseModel()
    const spy = jest.spyOn(form, "dispatchEvent")

    it("throws the validation errors if no options are given", () => {
      expect(() => model.parseValidationErrors(error)).toThrow(CustomValidationError)
    })

    it("throws the validation errors and dispatches an event to the form", () => {
      expect(() => model.parseValidationErrors(error, {form})).toThrow(CustomValidationError)
      expect(spy).toHaveBeenCalled()
    })

    it("doesnt throw validation errors if disabled", () => {
      model.parseValidationErrors(error, {form, throwValidationError: false})
      expect(spy).toHaveBeenCalled()
    })
  })
})
