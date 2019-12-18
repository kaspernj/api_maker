const inflection = require("inflection")

export default class ResourceRoute {
  constructor(args) {
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
    const result = []
    const parts = route.path.split("/")

    for(const part of parts) {
      if (part.match(/^:([a-z_]+)$/))
        result.push(part)
    }

    return result
  }

  requireComponent() {
    const requireResult = this.parsedContext[`components/${this.route.component}.jsx`]

    if (!requireResult)
      const requireResult = this.parsedContext[`components/${this.route.component}/index.jsx`]

    if (!requireResult)
      throw new Error(`No such require: ${this.route.component}`)

    return requireResult.default
  }

  withLocale() {
    const component = this.requireComponent()
    const Locales = require("shared/locales").default
    const Path = require("shared/path").default
    const routes = []

    for(const locale of Locales.availableLocales()) {
      const path = Path.localized(inflection.camelize(this.route.name, true), this.findRouteParams(this.route), {locale: locale})

      routes.push({
        path: path,
        component: component
      })
    }

    return routes
  }

  withoutLocale() {
    const routePathName = inflection.camelize(this.route.name, true)
    const routePathMethod = Routes[`${routePathName}Path`]

    if (!routePathMethod)
      throw new Error(`No such route could be found: ${routePathName}`)

    const path = routePathMethod.apply(null, this.findRouteParams(this.route))
    const component = this.requireComponent()

    return [{
      path: path,
      component: component
    }]
  }
}
