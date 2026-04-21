// @ts-check
import * as inflection from "inflection"
import Config from "./config.js"

/**
 * @typedef {object} ModelClassDataLike
 * @property {string} camelizedLower
 * @property {string} i18nKey
 * @property {string} name
 * @property {string} paramKey
 * @typedef {object} ModelNameData
 * @property {ModelClassDataLike} modelClassData
 */

/** Model name helper for i18n lookups and metadata. */
export default class ModelName {
  /** @param {ModelNameData} data */
  constructor(data) {
    this.data = data
  }

  /** @returns {string} */
  camelizedLower = () => this.data.modelClassData.camelizedLower

  /**
   * @param {{count?: number}} [args]
   * @returns {string}
   */
  human(args) {
    let argsToUse = args

    if (!argsToUse) argsToUse = {count: 1}

    let countKey

    if (argsToUse.count > 1 || argsToUse.count < 0) {
      countKey = "other"
    } else {
      countKey = "one"
    }

    const key = `activerecord.models.${this.data.modelClassData.i18nKey}.${countKey}`
    let defaultModelName = this.data.modelClassData.name

    if (args?.count > 1) defaultModelName = inflection.pluralize(defaultModelName)

    // @ts-expect-error
    return Config.getI18n().t(key, {defaultValue: defaultModelName})
  }

  /** @returns {string} */
  paramKey = () => this.data.modelClassData.paramKey
}
