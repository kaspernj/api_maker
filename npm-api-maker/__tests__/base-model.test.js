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

    const captureCallerFrame = () => {
      const stack = new Error().stack

      return stack ? stack.split("\n").find((line) => line.includes("reloadTrigger")) : undefined
    }

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

    it("keeps the triggering caller in the error stack when the requery result is malformed", async() => {
      const model = new User({a: {id: 7}})
      const ransackSpy = jest.spyOn(User, "ransack").mockReturnValue(requeryReturning({stale: true}))
      let callerFrame
      const setNewModelDataSpy = jest.spyOn(model, "setNewModelData").mockImplementation(() => {
        const error = new CustomError(`No modelData in model: ${JSON.stringify({stale: true})}`)
        // Production-shaped stack: the engine detached the async caller link,
        // so the natural stack only carries the frames inside the async method.
        error.stack = [
          `CustomError: No modelData in model: ${JSON.stringify({stale: true})}`,
          "    at t.setNewModelData (https://app.example/packs/js/chunk.js:2:72983)",
          "    at t.setNewModel (https://app.example/packs/js/chunk.js:2:72770)",
          "    at t.reload (https://app.example/packs/js/chunk.js:2:73779)"
        ].join("\n")
        throw error
      })

      try {
        const reloadTrigger = async() => {
          callerFrame = captureCallerFrame()
          return model.reload()
        }

        let thrownError

        try {
          await reloadTrigger()
        } catch (error) {
          thrownError = error
        }

        expect(thrownError).toBeInstanceOf(CustomError)
        expect(thrownError.stack).toContain(callerFrame.trim())
        expect(thrownError.stack).toContain("at t.setNewModelData (https://app.example/packs/js/chunk.js:2:72983)")
      } finally {
        setNewModelDataSpy.mockRestore()
        ransackSpy.mockRestore()
      }
    })

    it("does not duplicate the triggering caller when the stack already carries it", async() => {
      const model = new User({a: {id: 7}})
      const ransackSpy = jest.spyOn(User, "ransack").mockReturnValue(requeryReturning({stale: true}))
      let callerFrame
      const setNewModelDataSpy = jest.spyOn(model, "setNewModelData").mockImplementation(() => {
        const error = new CustomError(`No modelData in model: ${JSON.stringify({stale: true})}`)
        // When the engine attaches the async caller itself, the stack already
        // shows it and the caller frames must not be appended a second time.
        error.stack = [
          `CustomError: No modelData in model: ${JSON.stringify({stale: true})}`,
          "    at t.setNewModelData (https://app.example/packs/js/chunk.js:2:72983)",
          `    at async ${callerFrame.trim().replace(/^at /, "")}`
        ].join("\n")
        throw error
      })

      try {
        const reloadTrigger = async() => {
          callerFrame = captureCallerFrame()
          return model.reload()
        }

        let thrownError

        try {
          await reloadTrigger()
        } catch (error) {
          thrownError = error
        }

        expect(thrownError.stack.match(/reloadTrigger/g)).toHaveLength(1)
      } finally {
        setNewModelDataSpy.mockRestore()
        ransackSpy.mockRestore()
      }
    })

    it("keeps the triggering caller in the error stack when the requery itself fails", async() => {
      const model = new User({a: {id: 7}})
      const ransackSpy = jest.spyOn(User, "ransack").mockReturnValue({
        first: async() => {
          const error = new Error("The network request failed")
          error.stack = "Error: The network request failed\n    at CommandsPool.flush (https://app.example/packs/js/chunk.js:1:42)"
          throw error
        },
        queryArgs: {}
      })
      let callerFrame

      try {
        const reloadTrigger = async() => {
          callerFrame = captureCallerFrame()
          return model.reload()
        }

        let thrownError

        try {
          await reloadTrigger()
        } catch (error) {
          thrownError = error
        }

        expect(thrownError).toBeInstanceOf(Error)
        expect(thrownError.message).toBe("The network request failed")
        expect(thrownError.stack).toContain(callerFrame.trim())
        expect(thrownError.stack).toContain("CommandsPool.flush")
      } finally {
        ransackSpy.mockRestore()
      }
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

  describe("find", () => {
    const requeryReturning = (model) => ({
      first: async() => model,
      queryArgs: {}
    })

    const captureCallerFrame = () => {
      const stack = new Error().stack

      return stack ? stack.split("\n").find((line) => line.includes("findTrigger")) : undefined
    }

    it("throws a descriptive CustomError when the record is not found", async() => {
      const ransackSpy = jest.spyOn(User, "ransack").mockReturnValue(requeryReturning(undefined))

      try {
        await expect(User.find(7)).rejects.toThrow(CustomError)
        await expect(User.find(7)).rejects.toThrow("Record not found")
      } finally {
        ransackSpy.mockRestore()
      }
    })

    it("returns the found record", async() => {
      const found = new User({a: {id: 7}})
      const ransackSpy = jest.spyOn(User, "ransack").mockReturnValue(requeryReturning(found))

      try {
        await expect(User.find(7)).resolves.toEqual(found)
      } finally {
        ransackSpy.mockRestore()
      }
    })

    it("keeps the triggering caller in the error stack across the async lookup", async() => {
      const ransackSpy = jest.spyOn(User, "ransack").mockReturnValue(requeryReturning(undefined))
      let callerFrame

      try {
        const findTrigger = async() => {
          callerFrame = captureCallerFrame()

          return User.find(7)
        }

        let thrownError

        try {
          await findTrigger()
        } catch (error) {
          thrownError = error
        }

        expect(thrownError).toBeInstanceOf(CustomError)
        expect(thrownError.message).toBe("Record not found")
        expect(thrownError.stack).toContain(callerFrame.trim())
      } finally {
        ransackSpy.mockRestore()
      }
    })
  })
})
