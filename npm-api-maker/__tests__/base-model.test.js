jest.mock("@rails/actioncable", () => ({
  createConsumer: () => ({})
}))

const BaseModel = require("../src/base-model.cjs")
const CustomError = require("../src/custom-error.cjs")
const {JSDOM} = require("jsdom")
const {window} = new JSDOM()
const document = window.document
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
    const error = new CustomError("Some validation error", {
      response: {
        validation_errors: []
      }
    })
    const form = document.createElement("form")
    const model = new BaseModel()
    const dispatchEventSpy = jest.spyOn(form, "dispatchEvent").mockImplementation(() => "asd")
    const newCustomEventSpy = jest.spyOn(model, "newCustomEvent").mockImplementation(() => "asd")

    it("throws the validation errors if no options are given", () => {
      expect(() => model.parseValidationErrors(error)).toThrow(ValidationError)
    })

    it("throws the validation errors and dispatches an event to the form", () => {
      expect(() => model.parseValidationErrors(error, {form})).toThrow(ValidationError)
      expect(dispatchEventSpy).toHaveBeenCalled()
      expect(newCustomEventSpy).toHaveBeenCalled()
    })

    it("doesnt throw validation errors if disabled", () => {
      model.parseValidationErrors(error, {form, throwValidationError: false})
      expect(dispatchEventSpy).toHaveBeenCalled()
      expect(newCustomEventSpy).toHaveBeenCalled()
    })
  })
})
