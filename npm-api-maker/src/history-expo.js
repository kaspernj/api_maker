import parse from "url-parse"
import qs from "qs"

class HistoryExpo {
  push(path, ...params) {
    const url = parse(path, {})
    const actualParams = Object.assign({}, params)

    if (url.query) {
      Object.assign(actualParams, qs.parse(url.query.slice(1, url.query.length)))

      url.set("query", null)
    }

    const actualPath = url.href

    router.push({pathname: actualPath, params: actualParams})
  }
}

const historyExpo = new HistoryExpo()

export default historyExpo
