import ModelPropType from "../build/model-prop-type"
import Task from "./support/task"
import User from "./support/user"

describe("ModelPropType", () => {
  describe("ofModel", () => {
    it("validates model class successfully", () => {
      const user = new User({})
      const validator = ModelPropType.ofModel(User).isRequired
      const validation = validator({user}, "user")

      expect(validation).toBeUndefined()
    })

    it("validates model class unsuccessfully", () => {
      const task = new Task()
      const validator = ModelPropType.ofModel(User).isRequired
      const validation = validator({user: task}, "user")

      expect(validation).toEqual(new Error("Expected user to be of type User but it wasn't: Task"))
    })
  })

  describe("withLoadedAbilities", () => {
    it("validates required attributes successfully", () => {
      const user = new User({a: {id: 5}, b: {destroy: false, edit: true}})
      const validator = ModelPropType.ofModel(User).withLoadedAbilities(["destroy", "edit"]).isRequired
      const validation = validator({user}, "user")

      expect(validation).toBeUndefined()
    })

    it("validates required attributes unsuccessfully", () => {
      const user = new User({a: {id: 5}, b: {edit: true}})
      const validator = ModelPropType.ofModel(User).withLoadedAbilities(["destroy", "edit"]).isRequired
      const validation = validator({user}, "user")

      expect(validation).toEqual(new Error("The ability destroy was required to be loaded in user of the User type but it wasn't"))
    })
  })

  describe("withLoadedAssociation", () => {
    it("validates association is loaded overall successfully", () => {
      const task = new Task()
      const user = new User({r: {tasks: [task]}})

      const validator = ModelPropType
        .ofModel(User)
        .withLoadedAssociation("tasks")
        .previous()
        .isRequired

      const validation = validator({user}, "user")

      expect(validation).toBeUndefined()
    })

    it("validates association is loaded overall unsuccessfully", () => {
      const user = new User({r: {}})

      const validator = ModelPropType
        .ofModel(User)
        .withLoadedAssociation("tasks")
        .previous()
        .isRequired

      const validation = validator({user}, "user")

      expect(validation).toEqual(new Error("The association tasks was required to be loaded in user of the User type but it wasn't"))
    })

    it("validates attributes on nested associations", () => {
      const task = new Task({a: {id: 4, name: "Test task"}})
      const user = new User({r: {tasks: [task]}})

      const validator = ModelPropType.ofModel(User)
        .withLoadedAssociation("tasks")
          .withLoadedAttributes(["id", "name", "updatedAt"])
          .previous()
        .isRequired

      const validation = validator({user}, "user")

      expect(validation).toEqual(new Error("The attribute updatedAt was required to be loaded in user.tasks of the Task type but it wasn't"))
    })
  })

  describe("withLoadedAttributes", () => {
    it("validates required attributes successfully", () => {
      const user = new User({a: {id: 5, name: "Donald Duck"}})
      const validator = ModelPropType.ofModel(User).withLoadedAttributes(["id", "name"]).isRequired
      const validation = validator({user}, "user")

      expect(validation).toBeUndefined()
    })

    it("validates required attributes unsuccessfully", () => {
      const user = new User({a: {id: 5}})
      const validator = ModelPropType.ofModel(User).withLoadedAttributes(["id", "name"]).isRequired
      const validation = validator({user}, "user")

      expect(validation).toEqual(new Error("The attribute name was required to be loaded in user of the User type but it wasn't"))
    })

    it("ignores if the model is a new record", () => {
      const user = new User({isNewRecord: true})
      const validator = ModelPropType.ofModel(User).withLoadedAttributes(["id", "name"]).isRequired
      const validation = validator({user}, "user")

      expect(validation).toBeUndefined()
    })
  })
})
