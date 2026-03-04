import * as inflection from "inflection"
import {digg} from "diggerize"
import modelClassRequire from "../model-class-require.js"

/** ApiMakerBaseModelReflection. */
export default class ApiMakerBaseModelReflection {
  /**
   * @param {object} reflectionData
   * @param {string} reflectionData.foreignKey
   * @param {string} reflectionData.marco
   * @param {string} reflectionData.resource_name
   * @param {string} reflectionData.name
   * @param {string} reflectionData.through
   */
  constructor(reflectionData) {
    this.reflectionData = reflectionData
  }

  /** @returns {string} */
  foreignKey() { return digg(this, "reflectionData", "foreignKey") }

  /** macro. */
  macro() { return digg(this, "reflectionData", "macro") }

  /** @returns {typeof import("../base-model.js").default} */
  modelClass() { return modelClassRequire(inflection.singularize(inflection.camelize(digg(this, "reflectionData", "resource_name")))) }

  /** @returns {string} */
  name() { return inflection.camelize(digg(this, "reflectionData", "name"), true) }

  /** @returns {string} */
  through() { return digg(this, "reflectionData", "through") }
}
