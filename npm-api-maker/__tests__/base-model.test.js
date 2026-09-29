// @ts-check
import BaseModel from "../build/base-model.js"
import CustomError from "../build/custom-error.js"
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

  describe("reload", () => {
    const requeryReturning = (model) => ({
      first: async() => model,
      queryArgs: {}
    })

    it("throws a descriptive CustomError when the requery finds no record", async() => {
      const model = new User({a: {id: 7}})
      const ransackSpy = jest.spyOn(User, "ransack").mockReturnValue(requeryReturning(undefined))

      try {
        await expect(model.reload()).rejects.toThrow(CustomError)
        await expect(model.reload()).rejects.toThrow("Record not found while reloading User#7")
      } finally {
        ransackSpy.mockRestore()
      }
    })

    it("leaves the model data untouched when the requery finds no record", async() => {
      const model = new User({a: {id: 7, email: "old@example.com"}})
      const ransackSpy = jest.spyOn(User, "ransack").mockReturnValue(requeryReturning(null))

      try {
        await expect(model.reload()).rejects.toThrow(CustomError)
      } finally {
        ransackSpy.mockRestore()
      }

      expect(model.modelData).toEqual({id: 7, email: "old@example.com"})
    })

    it("keeps the triggering caller in the error stack across the async requery", async() => {
      const model = new User({a: {id: 7}})
      const ransackSpy = jest.spyOn(User, "ransack").mockReturnValue(requeryReturning(undefined))

      try {
        const reloadTrigger = async() => model.reload()

        let thrownError

        try {
          await reloadTrigger()
        } catch (error) {
          thrownError = error
        }

        expect(thrownError).toBeInstanceOf(CustomError)
        expect(thrownError.stack).toContain("reloadTrigger")
      } finally {
        ransackSpy.mockRestore()
      }
    })

    it("refreshes the model data from the requery result when found", async() => {
      const model = new User({a: {id: 7, email: "old@example.com"}})
      model.changes = {email: "unsaved@example.com"}
      const ransackSpy = jest.spyOn(User, "ransack").mockReturnValue(requeryReturning(new User({a: {id: 7, email: "new@example.com"}})))

      try {
        await model.reload()
      } finally {
        ransackSpy.mockRestore()
      }

      expect(model.modelData.email).toEqual("new@example.com")
      expect(model.changes).toEqual({})
    })
  })

  describe("setNewModelData", () => {
    it("throws a descriptive CustomError for a null model", () => {
      const model = new User({a: {id: 7}})

      expect(() => model.setNewModelData(null)).toThrow(CustomError)
      expect(() => model.setNewModelData(null)).toThrow("No modelData in model: null")
    })

    it("throws a descriptive CustomError for an undefined model", () => {
      const model = new User({a: {id: 7}})

      expect(() => model.setNewModelData(undefined)).toThrow(CustomError)
    })

    it("copies the model data from a valid model", () => {
      const model = new User({a: {id: 7}})
      const nextModel = new User({a: {id: 7, email: "new@example.com"}})

      model.setNewModel(nextModel)

      expect(model.modelData.email).toEqual("new@example.com")
    })
  })
})
