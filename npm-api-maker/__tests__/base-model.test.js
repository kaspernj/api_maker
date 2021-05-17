const BaseModel = require("../src/base-model.cjs")
const CustomError = require("../src/custom-error.cjs")
const ValidationError = require("../src/validation-error.cjs")

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
    const form = document.createElement("form")
    const spy = jest.spyOn(form, "dispatchEvent")

    it("throws the validation errors if not options are given", () => {
      const model = new BaseModel()
      const error = new CustomError("Some validation error", {
        response: {
          validation_errors: []
        }
      })

      expect(() => model.parseValidationErrors(error)).toThrow(ValidationError)
    })

    it("throws the validation errors and dispatches an event to the form", () => {
      const model = new BaseModel()
      const error = new CustomError("Some validation error", {
        response: {
          validation_errors: []
        }
      })

      expect(() => model.parseValidationErrors(error, {form})).toThrow(ValidationError)
      expect(spy).toHaveBeenCalled()
    })

    it("doesnt throw validation errors if disabled", () => {
      const model = new BaseModel()
      const error = new CustomError("Some validation error", {
        response: {
          validation_errors: []
        }
      })

      model.parseValidationErrors(error, {form, throwValidationError: false})
      expect(spy).toHaveBeenCalled()
    })
  })
})
