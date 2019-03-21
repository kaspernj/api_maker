export default class Path {
  static localized(pathName, params, args = {}) {
    if (args.locale) {
      var locale = args.locale
    } else {
      var locale = I18n.locale
    }

    var methodName = `${pathName}${Inflection.camelize(locale)}Path`
    var method = Routes[methodName]

    if (!method)
      throw `No such method: ${methodName}`

    return method.apply(null, params)
  }

  static localizedUrl(pathName, params) {
    var locale = document.querySelector("html").getAttribute("lang")
    var methodName = `${pathName}${Inflection.camelize(locale)}Url`
    var method = Routes[methodName]

    if (!method)
      throw `No such method: ${methodName}`

    return method.apply(null, params)
  }
}
