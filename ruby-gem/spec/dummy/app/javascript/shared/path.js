import Routes from "@kaspernj/api-maker/build/routes"

export default class Path {
  static localized(pathName, params, args = {}) {
    let locale

    if (args.locale) {
      locale = args.locale
    } else {
      locale = I18n.locale
    }

    const methodName = `${pathName}${Inflection.camelize(locale)}Path`
    const method = Routes[methodName]

    if (!method)
      throw `No such method: ${methodName}: ${Object.keys(Routes)}`

    return method.apply(null, params)
  }

  static localizedUrl(pathName, params) {
    const locale = document.querySelector("html").getAttribute("lang")
    const methodName = `${pathName}${Inflection.camelize(locale)}Url`
    const method = Routes[methodName]

    if (!method)
      throw `No such method: ${methodName}: ${Object.keys(Routes)}`

    return method.apply(null, params)
  }
}
