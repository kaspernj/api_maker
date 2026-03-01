import * as inflection from "inflection"
import {digg} from "diggerize"

/** Dynamic wrapper around generated JS routes. */
export default class ApiMakerRoutes {
  /** @param {{jsRoutes: Record<string, (...args: any[]) => string>, locale?: string, routeDefinitions: {routes: Array<Record<string, any>>}}} args */
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
          // @ts-expect-error
          routeNamePathToUse = inflection.camelize(`${digg(routeDefinition, "name")}_${I18n.locale}_path`, true) // eslint-disable-line no-undef
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
          // @ts-expect-error
          routeNameUrlToUse = inflection.camelize(`${digg(routeDefinition, "name")}_${I18n.locale}_url`, true) // eslint-disable-line no-undef
        } else {
          routeNameUrlToUse = routeNameUrl
        }

        return this.jsRoutes[routeNameUrlToUse](...args)
      }
    }
  }
}
