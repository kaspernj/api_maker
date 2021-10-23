const {digg} = require("diggerize")

module.exports = class Serializer {
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
    } else if (arg instanceof Date) {
      let offsetNumber = parseInt((arg.getTimezoneOffset() / 60) * 100)

      offsetNumber = -offsetNumber

      let offset = `${offsetNumber}`

      while(offset.length < 4) {
        offset = `0${offset}`
      }

      return {
        api_maker_type: "datetime",
        value: `${arg.getFullYear()}-${arg.getMonth() + 1}-${arg.getDate()} ${arg.getHours()}:${arg.getMinutes()}:${arg.getSeconds()}+${offset}`
      }
    } else if (Array.isArray(arg)) {
      return this.serializeArray(arg)
    } else if (typeof arg == "object" && arg !== null && arg.constructor.name == "Object") {
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
