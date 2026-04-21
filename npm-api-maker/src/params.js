// @ts-check
import Incorporator from "incorporator"
import config from "./config.js"
import formSerialize from "form-serialize"
import qs from "qs"
import urlEncode from "./url-encode.js"

/** @typedef {string | number | boolean | null | undefined} QueryParamPrimitive */
/** @typedef {Record<string, QueryParamPrimitive | object | Array<object | QueryParamPrimitive>>} QueryParams */
/** @typedef {{push: (path: string) => void}} AppHistoryLike */

/** Parses, merges, and writes query-string params for the current location. */
export default class Params {
  /** @returns {QueryParams} */
  static parse() {
    return /** @type {QueryParams} */ (qs.parse(globalThis.location.search.substr(1)))
  }

  /**
   * @param {QueryParams} given
   * @returns {QueryParams}
   */
  static change(given) {
    const incorporator = new Incorporator({objects: [Params.parse(), given]})

    incorporator.replaceArrayIfExists(true)

    return incorporator.merge()
  }

  /**
   * @param {QueryParams} params
   * @returns {string}
   */
  static withParams(params) {
    const newParams = qs.stringify(params, {encoder: urlEncode})
    const newPath = `${location.pathname}?${newParams}`

    return newPath
  }

  /**
   * @param {QueryParams} given
   * @param {{appHistory?: AppHistoryLike}} opts
   */
  static changeParams(given, opts = {}) {
    const params = Params.change(given)
    const newParams = qs.stringify(params, {encoder: urlEncode})
    const newPath = `${location.pathname}?${newParams}`
    const appHistory = opts.appHistory || config.getHistory()

    if (!appHistory) throw new Error("AppHistory hasn't been set in the ApiMaker configuration")

    appHistory.push(newPath)
  }

  /**
   * @param {HTMLFormElement} form
   * @returns {QueryParams}
   */
  static serializeForm(form) {
    const hash = /** @type {QueryParams} */ (formSerialize(form, {empty: true, hash: true}))
    return /** @type {QueryParams} */ (Params.setUndefined(hash))
  }

  /**
   * This is used to set all empty values to 'undefined' which makes qs removed those elements from the query string
   * @param {QueryParams | Array<object | QueryParamPrimitive> | QueryParamPrimitive} given
   * @returns {QueryParams | Array<object | QueryParamPrimitive> | QueryParamPrimitive}
   */
  static setUndefined(given) {
    if (Array.isArray(given)) {
      if (given.length == 0)
        return undefined

      return given.map((givenI) => Params.setUndefined(givenI))
    } else if (typeof given === "object") {
      if (Object.keys(given).length == 0)
        return undefined

      const newGiven = /** @type {QueryParams} */ ({})
      for (const key in given) {
        newGiven[key] = Params.setUndefined(given[key])
      }

      return newGiven
    } else if (given === "") {
      return undefined
    } else {
      return given
    }
  }
}
