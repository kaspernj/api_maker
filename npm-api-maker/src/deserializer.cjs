const {digg} = require("diggerize")
const inflection = require("inflection")
const Money = require("js-money")

module.exports = class ApiMakerDeserializer {
  static parse(object) {
    if (Array.isArray(object)) {
      return object.map((value) => ApiMakerDeserializer.parse(value))
    } else if (object && typeof object == "object") {
      if (object.api_maker_type == "date" || object.api_maker_type == "time") {
        const date = new Date(digg(object, "value"))

        return date
      } else if (object.api_maker_type == "money") {
        const cents = digg(object, "amount")
        const currency = digg(object, "currency")

        return Money.fromInteger(cents, currency)
      } else if (object.api_maker_type == "model") {
        const modelClassName = inflection.classify(digg(object, "model_name"))
        const modelClass = digg(require("@kaspernj/api-maker/src/models"), modelClassName)
        const data = ApiMakerDeserializer.parse(digg(object, "serialized"))
        const model = new modelClass({data, isNewRecord: false})

        return model
      } else if (object.api_maker_type == "resource") {
        const modelClassName = inflection.classify(digg(object, "name"))
        const modelClass = digg(require("@kaspernj/api-maker/src/models"), modelClassName)

        return modelClass
      } else {
        const newObject = {}

        for (const key in object) {
          const value = object[key]
          newObject[key] = ApiMakerDeserializer.parse(value)
        }

        return newObject
      }
    } else {
      return object
    }
  }
}
