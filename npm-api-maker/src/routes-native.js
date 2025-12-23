import {dig, digg, digs} from "diggerize"
import * as inflection from "inflection"
import qs from "qs"
import urlEncode from "./url-encode.js"

export default class ApiMakerRoutesNative {
  constructor ({getLocale}) {
    this.getLocale = getLocale
    this.routeDefinitions = []
    this.routeTranslationParts = {}
  }

  loadRouteDefinitions (routeDefinitions, routeDefinitionArgs) {
    for (const routeDefinition of digg(routeDefinitions, "routes")) {
      const {name, path} = digs(routeDefinition, "name", "path")
      const rawPathParts = path.split("/")
      const pathMethodName = `${inflection.camelize(name, true)}Path`
      const urlMethodName = `${inflection.camelize(name, true)}Url`

      if (routeDefinitionArgs && routeDefinitionArgs.localized) {
        const localizedRoutes = {}

        for (const locale in this.routeTranslationParts) {
          let variableCount = 0

          const localizedPathParts = [
            {type: "pathPart", name: ""},
            {type: "pathPart", name: locale}
          ]

          for (let i = 1; i < rawPathParts.length; i++) {
            const pathPart = rawPathParts[i]
            const variableMatch = pathPart.match(/^:([A-z_]+)$/)

            if (variableMatch) {
              localizedPathParts.push({type: "variable", count: variableCount++})
            } else if (pathPart) {
              const name = this.i18n.t(`routes.${pathPart}`, null, {default: pathPart, locale})

              localizedPathParts.push({type: "pathPart", name})
            }
          }

          localizedRoutes[locale] = localizedPathParts
        }

        this[pathMethodName] = (...args) => this.translateRoute(/** @type {any} */ ({args, localizedRoutes}))
        this[urlMethodName] = (...args) => this.translateRoute(/** @type {any} */ ({args, localizedRoutes, url: true}))
      } else {
        let variableCount = 0

        const pathParts = rawPathParts.map((pathPart) => {
          const variableMatch = pathPart.match(/^:([A-z_]+)$/)

          if (variableMatch) {
            return {type: "variable", count: variableCount}
          } else {
            return {type: "pathPart", name: pathPart}
          }
        })

        this[pathMethodName] = (...args) => this.translateRoute(/** @type {any} */ ({args, pathParts}))
        this[urlMethodName] = (...args) => this.translateRoute(/** @type {any} */ ({args, pathParts, url: true}))
      }
    }
  }

  loadRouteTranslations (i18n) {
    this.i18n = i18n
    const locales = digg(i18n, "locales")

    for (const locale in locales) {
      const routeTranslations = dig(locales, locale, "routes")

      if (!routeTranslations) continue
      if (!(locale in this.routeTranslationParts)) this.routeTranslationParts[locale] = {}

      for (const key in routeTranslations) {
        this.routeTranslationParts[locale][key] = routeTranslations[key]
      }
    }
  }

  translateRoute ({args, localizedRoutes, pathParts, url}) {
    let options

    // Extract options from args if any
    const lastArg = args[args.length - 1]

    if (lastArg && typeof lastArg == "object") {
      options = args.pop()
    } else {
      options = {}
    }

    // Take locale from options if given or fall back to fallback
    const {locale, host, port, protocol, ...restOptions} = options

    if (localizedRoutes) {
      // Put together route with variables and static translated parts (which were translated and cached previously)
      let translatedRoute = digg(localizedRoutes, locale || this.getLocale())
        .map((pathPart) => {
          if (pathPart.type == "pathPart") {
            return pathPart.name
          } else if (pathPart.type == "variable") {
            // Args might not contain the right amount of variables, so dont change this to 'digg'
            return dig(args, digg(pathPart, "count"))
          } else {
            throw new Error(`Unhandled path part type: ${pathPart.type}`)
          }
        })
        .join("/")

      if (restOptions && Object.keys(restOptions).length > 0) {
        translatedRoute += `?${qs.stringify(restOptions, {encoder: urlEncode})}`
      }

      if (url) return this.addHostToRoute({host, port, protocol, translatedRoute})

      return translatedRoute
    } else if (pathParts) {
      // Put together route with variables and static translated parts (which were translated and cached previously)
      let translatedRoute = pathParts
        .map((pathPart) => {
          if (pathPart.type == "pathPart") {
            return pathPart.name
          } else if (pathPart.type == "variable") {
            return digg(args, digg(pathPart, "count"))
          } else {
            throw new Error(`Unhandled path part type: ${pathPart.type}`)
          }
        })
        .join("/")

      if (restOptions && Object.keys(restOptions).length > 0) {
        translatedRoute += `?${qs.stringify(restOptions, {encoder: urlEncode})}`
      }

      if (url) return this.addHostToRoute({host, port, protocol, translatedRoute})

      return translatedRoute
    }

    throw new Error("Unhandled state")
  }

  addHostToRoute ({host, port, protocol, translatedRoute}) {
    let fullUrl = ""

    const hostToUse = host || globalThis.location && globalThis.location.host
    const portToUse = port || globalThis.location && globalThis.location.port

    if (!hostToUse) throw new Error("Unable to detect host")

    if (protocol) {
      fullUrl += `${protocol}://`
    } else if (globalThis.location && globalThis.location.protocol) {
      fullUrl += `${globalThis.location.protocol}//`
    } else {
      fullUrl += "https://"
    }

    fullUrl += hostToUse

    if (portToUse && ((protocol == "http" && portToUse != 80) || (protocol == "https" && port != 443))) {
      fullUrl += `:${portToUse}`
    }

    fullUrl += translatedRoute

    return fullUrl
  }
}
