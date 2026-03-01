import {digg} from "diggerize"
import * as inflection from "inflection" // eslint-disable-line sort-imports
import modelClassRequire from "./model-class-require.js"
import ModelsResponseReader from "./models-response-reader.js" // eslint-disable-line sort-imports
import Money from "js-money"

/** Deserializes API Maker encoded payloads. */
export default class ApiMakerDeserializer {
  static parse(object) {
    if (Array.isArray(object)) {
      return object.map((value) => ApiMakerDeserializer.parse(value))
    } else if (object && typeof object == "object") {
      if (object.api_maker_type == "date") {
        const date = new Date(digg(object, "value"))

        date.apiMakerType = "date"

        return date
      } else if (object.api_maker_type == "time") {
        const date = new Date(digg(object, "value"))

        date.apiMakerType = "time"

        return date
      } else if (object.api_maker_type == "collection") {
        // Need to remove type to avoid circular error
        const {api_maker_type, ...restObject} = object

        return ModelsResponseReader.collection(ApiMakerDeserializer.parse(restObject))
      } else if (object.api_maker_type == "money") {
        const cents = digg(object, "amount")
        const currency = digg(object, "currency")

        return Money.fromInteger(cents, currency)
      } else if (object.api_maker_type == "model") {
        const modelClassName = inflection.classify(digg(object, "model_name"))
        const ModelClass = modelClassRequire(modelClassName)
        const data = ApiMakerDeserializer.parse(digg(object, "serialized"))
        const model = new ModelClass({data, isNewRecord: false})

        return model
      } else if (object.api_maker_type == "resource") {
        const modelClassName = inflection.classify(digg(object, "name"))
        const ModelClass = modelClassRequire(modelClassName)

        return ModelClass
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
