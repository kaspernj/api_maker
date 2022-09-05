import formSerialize from "form-serialize"
import Incorporator from "incorporator"
import qs from "qs"

export default class Params {
  static parse () {
    return qs.parse(globalThis.location.search.substr(1))
  }

  static change (given) {
    const incorporator = new Incorporator({objects: [Params.parse(), given]})

    incorporator.replaceArrayIfExists(true)

    return incorporator.merge()
  }

  static withParams (params) {
    const newParams = qs.stringify(params)
    const newPath = `${location.pathname}?${newParams}`

    return newPath
  }

  static changeParams (given, opts = {}) {
    const params = Params.change(given)
    const newParams = qs.stringify(params)
    const newPath = `${location.pathname}?${newParams}`

    let appHistory = opts.appHistory || AppHistory

    appHistory.push(newPath)
  }

  static serializeForm (form) {
    const hash = formSerialize(form, {empty: true, hash: true})
    return Params.setUndefined(hash)
  }

  // This is used to set all empty values to 'undefined' which makes qs removed those elements from the query string
  static setUndefined (given) {
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
