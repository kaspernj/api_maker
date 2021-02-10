const {digg} = require("@kaspernj/object-digger")
const inflection = require("inflection")

export default class ApiMakerResourceRoute {
  constructor({jsRoutes, locales, requireComponent, routeDefinition}) {
    this.jsRoutes = jsRoutes
    this.locales = locales
    this.requireComponent = requireComponent
    this.routeDefinition = routeDefinition

    if (!jsRoutes) {
      throw new Error("No 'jsRoutes' given")
    }
  }

  routesResult() {
    if (digg(this, "locales")) {
      return this.withLocale()
    } else {
      return this.withoutLocale()
    }
  }

  findRouteParams() {
    const result = []
    const parts = digg(this, "routeDefinition", "path").split("/")

    for(const part of parts) {
      if (part.match(/^:([a-z_]+)$/))
        result.push(part)
    }

    return result
  }

  requireComponentFromCaller() {
    return this.requireComponent({
      routeDefinition: digg(this, "routeDefinition")
    })
  }

  withLocale() {
    const component = this.requireComponentFromCaller()
    const Locales = require("shared/locales").default
    const Path = require("shared/path").default
    const routes = []

    for(const locale of Locales.availableLocales()) {
      const path = Path.localized(inflection.camelize(digg(this, "routeDefinition", "name"), true), this.findRouteParams(), {locale})

      routes.push({path, component})
    }

    return routes
  }

  withoutLocale() {
    const routePathName = inflection.camelize(digg(this, "routeDefinition", "name"), true)
    const routePathMethod = this.jsRoutes[`${routePathName}Path`]

    if (!routePathMethod)
      throw new Error(`No such route could be found: ${routePathName}`)

    const path = routePathMethod.apply(null, this.findRouteParams())
    const component = this.requireComponentFromCaller()

    return [{
      path,
      component
    }]
  }
}
