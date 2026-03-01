import Incorporator from "incorporator"
import config from "./config.js"
import formSerialize from "form-serialize"
import qs from "qs"
import urlEncode from "./url-encode.js"

/** Params. */
export default class Params {
  /** @returns {Record<string, any>} */
  static parse() {
    return qs.parse(globalThis.location.search.substr(1))
  }

  /**
   * @param {object} given
   * @returns {object}
   */
  static change(given) {
    const incorporator = new Incorporator({objects: [Params.parse(), given]})

    incorporator.replaceArrayIfExists(true)

    return incorporator.merge()
  }

  /**
   * @param {Record<string, any>} params
   * @returns {string}
   */
  static withParams(params) {
    const newParams = qs.stringify(params, {encoder: urlEncode})
    const newPath = `${location.pathname}?${newParams}`

    return newPath
  }

  /**
   * @param {Record<string, any>} given
   * @param {{appHistory?: any}} opts
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
   * @returns {Record<string, any>}
   */
  static serializeForm(form) {
    const hash = formSerialize(form, {empty: true, hash: true})
    return Params.setUndefined(hash)
  }

  /**
   * This is used to set all empty values to 'undefined' which makes qs removed those elements from the query string
   * @param {Record<string, any>} given
   * @returns {Record<string, any>}
   */
  static setUndefined(given) {
    if (Array.isArray(given)) {
      if (given.length == 0)
        return undefined

      return given.map((givenI) => Params.setUndefined(givenI))
    } else if (typeof given === "object") {
      if (Object.keys(given).length == 0)
        return undefined

      const newGiven = {}
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
