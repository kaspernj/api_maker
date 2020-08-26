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
    if (typeof this.arg == "function" && this.arg["modelClassData"] && this.arg["modelName"]) {
      return {
        api_maker_type: "resource",
        name: digg(this.arg.modelClassData(), "name")
      }
    } else if (Array.isArray(this.arg)) {
      return this.serializeArray()
    } else if (typeof this.arg == "object") {
      return this.serializeObject()
    } else {
      return this.arg
    }
  }

  serializeArray() {
    return this.arg.map((value) => Serializer.serialize(value))
  }

  serializeObject() {
    const newObject = {}

    for (const key in this.arg) {
      const newValue = Serializer.serialize(this.arg[key])
      const newKey = Serializer.serialize(key)

      newObject[newKey] = newValue
    }

    return newObject
  }
}
