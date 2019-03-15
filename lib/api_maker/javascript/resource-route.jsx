const inflection = require("inflection")

export default class ResourceRoute {
  constructor(props) {
    this.props = props
  }

  routes() {
    if (this.props.locales) {
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

  withLocale() {
    var { route } = this.props
    var component = require(`components/${route.component}`).default
    var Locales = require("shared/locales").default
    var Path = require("shared/path").default
    var routes = []

    for(var locale of Locales.availableLocales()) {
      var path = Path.localized(inflection.camelize(route.name, true), this.findRouteParams(route), {locale: locale})

      routes.push({
        path: path,
        component: component
      })
    }

    return routes
  }

  withoutLocale() {
    var { route } = this.props
    var routePathName = inflection.camelize(route.name, true)
    var routePathMethod = Routes[`${routePathName}Path`]

    if (!routePathMethod)
      throw new Error(`No such route could be found: ${routePathName}`)

    var path = routePathMethod.apply(null, this.findRouteParams(route))
    var component = require(`components/${route.component}`).default

    return [{
      path: path,
      component: component
    }]
  }
}
