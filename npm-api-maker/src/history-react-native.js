// @ts-check
import Config from "./config.js"
import parse from "url-parse"
import qs from "qs"

/** @typedef {string | number | boolean | null | undefined} HistoryParamValue */
/** @typedef {Record<string, HistoryParamValue>} HistoryParams */

/** React Native history adapter. */
class HistoryReactNative {
  /**
   * @param {string} path
   * @param {...HistoryParams} params
   * @returns {void}
   */
  push(path, ...params) {
    const url = parse(path, {})

    if (url.query) {
      const actualParams = Object.assign({}, params) // eslint-disable-line prefer-object-spread

      Object.assign(actualParams, qs.parse(url.query.slice(1, url.query.length)))

      url.set("query", qs.stringify(actualParams))
    }

    // @ts-expect-error
    const {linkTo} = Config.getLinkTo()

    linkTo(url.href)
  }
}

const historyReactNative = new HistoryReactNative()

export default historyReactNative
