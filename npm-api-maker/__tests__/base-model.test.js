import BaseModel from "../build/base-model.js"
import {JSDOM} from "jsdom"
import User from "./support/user"
import ValidationError from "../build/validation-error.js"
import {jest} from "@jest/globals"

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

    it("builds a full cache key for persisted models without a loaded primary key", () => {
      const user = new User({a: {email: "teacher@example.com"}})

      user.newRecord = false
      user.uniqueKey = () => "temporary-cache-key"

      expect(() => user.fullCacheKey()).not.toThrow()
      expect(user.fullCacheKey()).toEqual(expect.any(String))
    })

    it("falls back to the unique key when a loaded primary key is empty", () => {
      const user = new User({a: {email: "teacher@example.com", id: null}})

      user.newRecord = false
      user.uniqueKey = () => "temporary-cache-key"

      expect(() => user.fullCacheKey()).not.toThrow()
      expect(user.fullCacheKey()).toEqual(expect.any(String))
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

  describe("ensureAssociationLoaded", () => {
    it("loads an unloaded belongs_to association", async() => {
      const model = new BaseModel()
      const account = {id: 5}
      const accountMethod = () => account
      const loadAccountMethod = async() => account

      model.modelClassData = () => ({
        name: "User",
        relationships: [{name: "account", macro: "belongs_to"}]
      })
      model.relationships = {}
      model.relationshipsCache = {}
      model.account = accountMethod
      model.loadAccount = loadAccountMethod
      const loadAccountSpy = jest.spyOn(model, "loadAccount")

      await expect(model.ensureAssociationLoaded("account")).resolves.toEqual(account)
      expect(loadAccountSpy).toHaveBeenCalledTimes(1)
    })

    it("returns the loaded has_many relationship without reloading", async() => {
      const model = new BaseModel()
      const projects = [{id: 1}]
      const projectsMethod = () => ({loaded: () => projects})
      const loadProjectsMethod = async() => projects

      model.modelClassData = () => ({
        name: "User",
        relationships: [{name: "projects", macro: "has_many"}]
      })
      model.relationships = {}
      model.relationshipsCache = {projects}
      model.projects = projectsMethod
      model.loadProjects = loadProjectsMethod
      const loadProjectsSpy = jest.spyOn(model, "loadProjects")

      await expect(model.ensureAssociationLoaded("projects")).resolves.toEqual(projects)
      expect(loadProjectsSpy).not.toHaveBeenCalled()
    })
  })

  describe("parseValidationErrors", () => {
    const error = new ValidationError({
      getUnhandledErrorMessage: () => "Some validation error",
      getErrorMessage: () => "Some validation error"
    }, {
      response: {
        validation_errors: [
          {
            attribute_name: "name",
            attribute_type: "string",
            error_messages: ["can't be blank"],
            error_types: ["blank"],
            input_name: "user[name]",
            model_name: "user"
          }
        ]
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
