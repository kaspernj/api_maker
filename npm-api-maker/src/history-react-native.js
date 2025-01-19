import Config from "./config"
import parse from "url-parse"
import qs from "qs"

class HistoryReactNative {
  push(path, ...params) {
    const url = parse(path, {})
    const actualParams = Object.assign({}, params)

    if (url.query) {
      Object.assign(actualParams, qs.parse(url.query.slice(1, url.query.length)))

      url.set("query", null)
    }

    const actualPath = url.href

    console.log("HistoryReactNative push", {path: actualPath, params: actualParams, url})
    console.log("getLinkTo")

    const {linkTo} = Config.getLinkTo()

    console.log({navigation, href: url.href})
    console.log("Calling linkTo")

    linkTo(url.href)
  }
}

const historyReactNative = new HistoryReactNative()

export default historyReactNative
