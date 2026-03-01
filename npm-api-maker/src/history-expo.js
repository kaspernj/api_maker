import parse from "url-parse"
import qs from "qs"

/** Expo router history adapter. */
class HistoryExpo {
  /**
   * @param {string} path
   * @param {...Record<string, any>} params
   * @returns {void}
   */
  push(path, ...params) {
    const url = parse(path, {})
    const actualParams = Object.assign({}, params) // eslint-disable-line prefer-object-spread

    if (url.query) {
      Object.assign(actualParams, qs.parse(url.query.slice(1, url.query.length)))

      url.set("query", null)
    }

    const actualPath = url.href

    // @ts-expect-error
    router.push({pathname: actualPath, params: actualParams}) // eslint-disable-line no-undef
  }
}

const historyExpo = new HistoryExpo()

export default historyExpo
