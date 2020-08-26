import {digg} from "@kaspernj/object-digger"

export default class Serializer {
  static serialize(arg) {
    const serialize = new Serializer(arg)

    return serialize.serialize()
  }

  constructor(arg) {
    this.arg = arg
  }

  serialize() {
    return this.serializeArgument(this.arg)
  }

  serializeArgument(arg) {
    if (typeof arg == "function" && arg["modelClassData"] && arg["modelName"]) {
      return {
        api_maker_type: "resource",
        name: digg(arg.modelClassData(), "name")
      }
    } else if (Array.isArray(arg)) {
      return this.serializeArray(arg)
    } else if (arg && typeof arg == "object" && arg.constructor.name == "Object") {
      return this.serializeObject(arg)
    } else {
      return arg
    }
  }

  serializeArray(arg) {
    return arg.map((value) => this.serializeArgument(value))
  }

  serializeObject(arg) {
    const newObject = {}

    for (const key in arg) {
      const value = arg[key]
      const newValue = this.serializeArgument(value)
      const newKey = this.serializeArgument(key)

      newObject[newKey] = newValue
    }

    return newObject
  }
}
