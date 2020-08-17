import Money from "js-money"

const inflection = require("inflection")

export default class ApiMakerDeserializer {
  static parse(object) {
    if (Array.isArray(object)) {
      return object.map(value => ApiMakerDeserializer.parse(value))
    } else if (object && typeof object == "object") {
      if (object.api_maker_type == "money") {
        const cents = object.amount
        const currency = object.currency

        return Money.fromInteger(cents, currency)
      } else if (object.api_maker_type == "model") {
        const modelClassName = inflection.classify(object.model_name.replace(/-/, "_"))
        const modelClass = require("api-maker/models")[modelClassName]
        const model = new modelClass({data: object.serialized, isNewRecord: false})

        return model
      } else {
        const newObject = {}

        for(const key in object) {
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
