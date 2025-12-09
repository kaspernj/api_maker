import {digg} from "diggerize"
import * as inflection from "inflection"
import modelClassRequire from "../model-class-require"

export default class ApiMakerBaseModelReflection {
  constructor(reflectionData) {
    this.reflectionData = reflectionData
  }

  /**
   * @returns {string}
   */
  foreignKey() { return digg(this, "reflectionData", "foreignKey") }

  macro() { return digg(this, "reflectionData", "macro") }

  /**
   * @returns {typeof import("../base-model.js").default}
   */
  modelClass() { return modelClassRequire(inflection.singularize(inflection.camelize(digg(this, "reflectionData", "resource_name")))) }

  /**
   * @returns {string}
   */
  name() { return inflection.camelize(digg(this, "reflectionData", "name"), true) }

  /**
   * @returns {string}
   */
  through() { return digg(this, "reflectionData", "through") }
}
