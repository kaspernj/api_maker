const ModelPropType = require("../src/model-prop-type.cjs")
const Task = require("./support/task")
const User = require("./support/user")

describe("ModelPropType", () => {
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

      expect(validation).toEqual(new Error("name was required to be loaded in user of the User type but it wasn't"))
    })
  })
})
