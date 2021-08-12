const formSerialize = require("form-serialize")
const {merge} = require("./merge.cjs")
const qs = require("qs")

module.exports = class Params {
  static parse() {
    return qs.parse(global.location.search.substr(1))
  }

  static change(given) {
    return merge(Params.parse(), given)
  }

  static changeParams(given, opts = {}) {
    const params = Params.change(given)
    const newParams = qs.stringify(params)
    const newPath = `${location.pathname}?${newParams}`

    let appHistory = opts.appHistory || AppHistory

    appHistory.push(newPath)
  }

  static serializeForm(form) {
    const hash = formSerialize(form, {empty: true, hash: true})
    return Params.setUndefined(hash)
  }

  // This is used to set all empty values to 'undefined' which makes qs removed those elements from the query string
  static setUndefined(given) {
    if (Array.isArray(given)) {
      if (given.length == 0)
        return undefined

      return given.map(givenI => Params.setUndefined(givenI))
    } else if (typeof given === "object") {
      if (Object.keys(given).length == 0)
        return undefined

      const newGiven = {}
      for(const key in given) {
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
