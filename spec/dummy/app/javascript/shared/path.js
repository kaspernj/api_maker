export default class Path {
  static localized(pathName, params, args = {}) {
    if (args.locale) {
      const locale = args.locale
    } else {
      const locale = I18n.locale
    }

    const methodName = `${pathName}${Inflection.camelize(locale)}Path`
    const method = Routes[methodName]

    if (!method)
      throw `No such method: ${methodName}`

    return method.apply(null, params)
  }

  static localizedUrl(pathName, params) {
    const locale = document.querySelector("html").getAttribute("lang")
    const methodName = `${pathName}${Inflection.camelize(locale)}Url`
    const method = Routes[methodName]

    if (!method)
      throw `No such method: ${methodName}`

    return method.apply(null, params)
  }
}
