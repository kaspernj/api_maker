const inflection = require("inflection")

export default class ResourceRoute {
  constructor(args) {
    console.log({ args })
    this.args = args.args
    this.parsedContext = args.parsedContext
    this.route = args.route
  }

  routes() {
    if (this.args.locales) {
      return this.withLocale()
    } else {
      return this.withoutLocale()
    }
  }

  findRouteParams(route) {
    var result = []
    var parts = route.path.split("/")

    for(var part of parts) {
      if (part.match(/^:([a-z_]+)$/))
        result.push(part)
    }

    return result
  }

  requireComponent() {
    var requireResult = this.parsedContext[`components/${this.route.component}.jsx`]

    if (!requireResult)
      var requireResult = this.parsedContext[`components/${this.route.component}/index.jsx`]

    if (!requireResult)
      throw new Error(`No such require: ${this.route.component}`)

    return requireResult.default
  }

  withLocale() {
    var component = this.requireComponent()
    var Locales = require("shared/locales").default
    var Path = require("shared/path").default
    var routes = []

    for(var locale of Locales.availableLocales()) {
      var path = Path.localized(inflection.camelize(this.route.name, true), this.findRouteParams(this.route), {locale: locale})

      routes.push({
        path: path,
        component: component
      })
    }

    return routes
  }

  withoutLocale() {
    var routePathName = inflection.camelize(this.route.name, true)
    var routePathMethod = Routes[`${routePathName}Path`]

    if (!routePathMethod)
      throw new Error(`No such route could be found: ${routePathName}`)

    var path = routePathMethod.apply(null, this.findRouteParams(this.route))
    var component = this.requireComponent()

    return [{
      path: path,
      component: component
    }]
  }
}
