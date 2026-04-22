// @ts-check
import {digg} from "diggerize"

/**
 * @typedef {string | number | boolean | null | undefined} SerializablePrimitive
 * @typedef {object | SerializablePrimitive | Array<object | SerializablePrimitive>} SerializableInputValue
 * @typedef {object | SerializablePrimitive | Array<object | SerializablePrimitive>} SerializedOutputValue
 * @typedef {Record<string, SerializedOutputValue>} SerializedObject
 */

/** Serializes API Maker payloads and model references. */
export default class Serializer {
  /**
   * Serializes one value without manually instantiating the serializer class.
   * @param {SerializableInputValue} arg
   * @returns {SerializedOutputValue}
   */
  static serialize (arg) {
    const serialize = new Serializer(arg)

    return serialize.serialize()
  }

  /**
   * Creates a serializer bound to one root argument.
   * @param {SerializableInputValue} arg
   */
  constructor (arg) {
    this.arg = arg
  }

  /**
   * Serializes the root argument passed to this serializer instance.
   * @returns {SerializedOutputValue}
   */
  serialize () {
    return this.serializeArgument(this.arg)
  }

  /**
   * Serializes one scalar, model, collection, array, or plain object value.
   * @param {SerializableInputValue} arg
   * @returns {SerializedOutputValue}
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
   * Serializes each element of one array argument.
   * @param {SerializableInputValue[]} arg
   * @returns {SerializedOutputValue[]}
   */
  serializeArray (arg) {
    return arg.map((value) => this.serializeArgument(value))
  }

  /**
   * Serializes each key and value in one plain object argument.
   * @param {Record<string, SerializableInputValue>} arg
   * @returns {SerializedObject}
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
