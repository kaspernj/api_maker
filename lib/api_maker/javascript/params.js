import formSerialize from "form-serialize"
import KeyValueStore from "api-maker/key-value-store"
import merge from "merge"
import qs from "qs"

export default class Params {
  static parse() {
    return qs.parse(window.location.search.substr(1))
  }

  static change(given) {
    return merge.recursive(true, Params.parse(), given)
  }

  static changeParams(given) {
    const params = Params.change(given)
    const newParams = qs.stringify(params)
    const newPath = `${location.pathname}?${newParams}`

    AppHistory.push(newPath)
  }

  static async getCachedParams(paramName, args = {}) {
    const oldQuery = await KeyValueStore.get(paramName)
    const params = Params.parse()

    if (params && paramName in params) {
      return params[paramName]
    } else if (oldQuery) {
      return oldQuery
    } else {
      return args.default || {}
    }
  }

  static async setCachedParams(paramName, qParams) {
    return await KeyValueStore.set(paramName, qParams)
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
