// @ts-check
import {digg} from "diggerize"

/** Serializes API Maker payloads and model references. */
export default class Serializer {
  /**
   * serialize.
   * @param {any} arg
   * @returns {any}
   */
  static serialize (arg) {
    const serialize = new Serializer(arg)

    return serialize.serialize()
  }

  /**
   * Constructor.
   * @param {any} arg
   */
  constructor (arg) {
    this.arg = arg
  }

  /**
   * serialize.
   * @returns {any}
   */
  serialize () {
    return this.serializeArgument(this.arg)
  }

  /**
   * serializeArgument.
   * @param {any} arg
   * @returns {any | object}
   */
  serializeArgument (arg) {
    if (typeof arg == "object" && arg && arg.constructor.apiMakerType == "BaseModel") {
      return {
        api_maker_type: "model",
        model_class_name: digg(arg.modelClassData(), "name"),
        model_id: arg.id()
      }
    } else if (typeof arg == "function" && arg.apiMakerType == "BaseModel") {
      return {
        api_maker_type: "resource",
        name: digg(arg.modelClassData(), "name")
      }
    } else if (arg instanceof Date) {
      let offsetNumber = parseInt(`${arg.getTimezoneOffset() / 60 * 100}`, 10)

      offsetNumber = -offsetNumber

      let offset = `${offsetNumber}`

      while (offset.length < 4) {
        offset = `0${offset}`
      }

      return {
        api_maker_type: "datetime",
        value: `${arg.getFullYear()}-${arg.getMonth() + 1}-${arg.getDate()} ${arg.getHours()}:${arg.getMinutes()}:${arg.getSeconds()}+${offset}`
      }
    } else if (Array.isArray(arg)) {
      return this.serializeArray(arg)
    } else if (typeof arg == "object" && arg && arg.constructor && arg.constructor.apiMakerType == "Collection") {
      return {
        api_maker_type: "collection",
        value: this.serializeObject(arg)
      }
    } else if (typeof arg == "object" && arg !== null && arg.constructor.name == "Object") {
      return this.serializeObject(arg)
    } else {
      return arg
    }
  }

  /**
   * serializeArray.
   * @param {any} arg
   * @returns {any}
   */
  serializeArray (arg) {
    return arg.map((value) => this.serializeArgument(value))
  }

  /**
   * serializeObject.
   * @param {any} arg
   * @returns {any}
   */
  serializeObject (arg) {
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
