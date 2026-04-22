// @ts-check
import * as inflection from "inflection"
import {digg} from "diggerize"
import modelClassRequire from "../model-class-require.js"

/** @typedef {"belongs_to" | "has_many" | "has_one"} ReflectionMacro */

/** Describes one relationship declared on a model class. */
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

  /**
   * Returns the relationship macro for this reflection.
   * @returns {ReflectionMacro}
   */
  macro() { return digg(this, "reflectionData", "macro") }

  /** @returns {typeof import("../base-model.js").default} */
  modelClass() { return modelClassRequire(inflection.singularize(inflection.camelize(digg(this, "reflectionData", "resource_name")))) }

  /** @returns {string} */
  name() { return inflection.camelize(digg(this, "reflectionData", "name"), true) }

  /** @returns {string} */
  through() { return digg(this, "reflectionData", "through") }
}
