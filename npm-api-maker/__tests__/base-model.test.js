import BaseModel from "../build/base-model.js"
import {jest} from "@jest/globals"
import {JSDOM} from "jsdom"
import ValidationError from "../build/validation-error.js"
import User from "./support/user"

jest.mock("@rails/actioncable", () => ({
  createConsumer: () => ({})
}))

const {window} = new JSDOM()
const document = window.document

describe("BaseModel", () => {
  describe("identifierKey", () => {
    it("returns the id when persisted", () => {
      const user = new User({a: {id: 5}})

      expect(user.identifierKey()).toEqual(5)
    })

    it("returns the unique key when new record", () => {
      const user = new User({isNewRecord: true})

      user.uniqueKey = () => 45

      expect(user.identifierKey()).toEqual(45)
    })
  })

  describe("update", () => {
    it("aborts if no changes", async() => {
      const model = new BaseModel()

      // This will fail because of missing setup if it doesn't abort.
      const response = await model.update({})

      // There will be extra objects in the hash if it actually calls the backend.
      expect(response).toEqual({model})
    })
  })

  describe("parseValidationErrors", () => {
    const error = new ValidationError({
      getUnhandledErrorMessage: () => "Some validation error",
      getErrorMessage: () => "Some validation error"
    }, {
      response: {
        validation_errors: [{
          attribute_name: "name",
          attribute_type: "string",
          error_messages: ["can't be blank"],
          error_types: ["blank"],
          input_name: "user[name]",
          model_name: "user"
        }]
      }
    })
    const form = document.createElement("form")
    const model = new BaseModel()
    const dispatchEventSpy = jest.spyOn(form, "dispatchEvent").mockImplementation(() => "asd")
    const newCustomEventSpy = jest.spyOn(BaseModel, "newCustomEvent").mockImplementation(() => "asd")

    beforeEach(() => {
      dispatchEventSpy.mockClear()
      newCustomEventSpy.mockClear()
    })

    it("throws the validation errors if no options are given", () => {
      expect(() => BaseModel.parseValidationErrors({error, model})).toThrow(ValidationError)
    })

    it("throws the validation errors and dispatches an event to the form", () => {
      expect(() => BaseModel.parseValidationErrors({error, model, options: {form}})).toThrow(ValidationError)
      expect(dispatchEventSpy).toHaveBeenCalled()
      expect(newCustomEventSpy).toHaveBeenCalled()
    })

    it("doesnt throw validation errors if disabled", () => {
      BaseModel.parseValidationErrors({error, model, options: {throwValidationError: false}})
      expect(dispatchEventSpy).not.toHaveBeenCalled()
      expect(newCustomEventSpy).not.toHaveBeenCalled()
    })
  })
})
