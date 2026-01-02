import Config from "./config.js"
import parse from "url-parse"
import qs from "qs"

class HistoryReactNative {
  push(path, ...params) {
    const url = parse(path, {})

    if (url.query) {
      const actualParams = Object.assign({}, params)

      Object.assign(actualParams, qs.parse(url.query.slice(1, url.query.length)))

      url.set("query", qs.stringify(actualParams))
    }

    const {linkTo} = Config.getLinkTo()

    linkTo(url.href)
  }
}

const historyReactNative = new HistoryReactNative()

export default historyReactNative
