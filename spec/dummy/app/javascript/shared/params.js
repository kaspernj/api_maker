import qs from "qs"

export default class Params {
  static parse() {
    return qs.parse(window.location.search.substr(1))
  }

  static change(given) {
    return Object.assign(Params.parse(), given)
  }

  static changeParams(given) {
    var params = Params.change(given)
    var newParams = qs.stringify(params)
    var newPath = `${location.pathname}?${newParams}`

    AppHistory.push(newPath)
  }
}
