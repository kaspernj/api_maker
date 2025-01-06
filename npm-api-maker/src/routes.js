import {digg} from "diggerize"
import * as inflection from "inflection"

export default class ApiMakerRoutes {
  constructor ({jsRoutes, locale, routeDefinitions}) {
    if (!jsRoutes) throw new Error("'jsRoutes' wasn't given")

    this.jsRoutes = jsRoutes
    this.routeDefinitions = routeDefinitions

    for (const routeDefinition of digg(this, "routeDefinitions", "routes")) {
      let testRouteNamePath, testRouteNameUrl

      const routeNamePath = inflection.camelize(`${digg(routeDefinition, "name")}_path`, true)
      const routeNameUrl = inflection.camelize(`${digg(routeDefinition, "name")}_url`, true)

      if (locale) {
        testRouteNamePath = inflection.camelize(`${digg(routeDefinition, "name")}_${locale}_path`, true)
        testRouteNameUrl = inflection.camelize(`${digg(routeDefinition, "name")}_${locale}_url`, true)
      } else {
        testRouteNamePath = inflection.camelize(`${digg(routeDefinition, "name")}_path`, true)
        testRouteNameUrl = inflection.camelize(`${digg(routeDefinition, "name")}_url`, true)
      }

      if (!(testRouteNamePath in this.jsRoutes)) {
        throw new Error(`No such path in JS routes: ${testRouteNamePath}: ${Object.keys(this.jsRoutes).join(", ")}`)
      }

      this[routeNamePath] = (...args) => {
        let routeNamePathToUse

        if (locale) {
          routeNamePathToUse = inflection.camelize(`${digg(routeDefinition, "name")}_${I18n.locale}_path`, true)
        } else {
          routeNamePathToUse = routeNamePath
        }

        return this.jsRoutes[routeNamePathToUse](...args)
      }

      if (!(testRouteNameUrl in this.jsRoutes)) {
        throw new Error(`No such URL in JS routes: ${testRouteNameUrl}: ${Object.keys(this.jsRoutes).join(", ")}`)
      }

      this[routeNameUrl] = (...args) => {
        let routeNameUrlToUse

        if (locale) {
          routeNameUrlToUse = inflection.camelize(`${digg(routeDefinition, "name")}_${I18n.locale}_url`, true)
        } else {
          routeNameUrlToUse = routeNameUrl
        }

        return this.jsRoutes[routeNameUrlToUse](...args)
      }
    }
  }
}
