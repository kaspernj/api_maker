import Money from "js-money"

const inflection = require("inflection")

export default class ApiMakerDeserializer {
  static parse(object) {
    if (Array.isArray(object)) {
      return object.map(value => ApiMakerDeserializer.parse(value))
    } else if (object && typeof object == "object") {
      if (object.api_maker_type == "money") {
        var cents = object.amount
        var currency = object.currency

        return Money.fromInteger(cents, currency)
      } else if (object.api_maker_type == "model") {
        var modelClassName = inflection.singularize(object.model_name)
        var modelClass = require(`api-maker/models/${modelClassName}`).default
        var model = new modelClass({data: object.serialized, isNewRecord: false})

        return model
      } else {
        var newObject = {}

        for(var key in object) {
          var value = object[key]
          newObject[key] = ApiMakerDeserializer.parse(value)
        }

        return newObject
      }
    } else {
      return object
    }
  }
}
