import qs from "qs"

export default class Params {
  static parse() {
    return qs.parse(window.location.search.substr(1))
  }

  static change(given) {
    return Object.assign(Params.parse(), given)
  }

  static changeParams(given) {
    const params = Params.change(given)
    const newParams = qs.stringify(params)
    const newPath = `${location.pathname}?${newParams}`

    AppHistory.push(newPath)
  }
}
