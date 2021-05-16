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
    it("throws the validation errors", () => {
      const model = new BaseModel()
      const error = new CustomError("Some validation error", {
        response: {
          validation_errors: []
        }
      })

      expect(() => model.parseValidationErrors(error)).toThrow(ValidationError)
    })
  })
})
