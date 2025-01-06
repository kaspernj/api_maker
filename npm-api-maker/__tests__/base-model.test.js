import BaseModel from "../src/base-model"
import CustomError from "../src/custom-error"
import {jest} from "@jest/globals"
import {JSDOM} from "jsdom"
import ValidationError from "../src/validation-error"
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
    const newCustomEventSpy = jest.spyOn(BaseModel, "newCustomEvent").mockImplementation(() => "asd")

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
      expect(dispatchEventSpy).toHaveBeenCalled()
      expect(newCustomEventSpy).toHaveBeenCalled()
    })
  })
})
