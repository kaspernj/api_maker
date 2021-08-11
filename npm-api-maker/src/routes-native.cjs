const {dig, digg, digs} = require("@kaspernj/object-digger")
const inflection = require("inflection")

module.exports = class ApiMakerRoutesNative {
  constructor({getLocale}) {
    this.getLocale = getLocale
    this.routeDefinitions = []
    this.routeTranslationParts = {}
  }

  loadRouteDefinitions(routeDefinitions, routeDefinitionArgs) {
    for (const routeDefinition of digg(routeDefinitions, "routes")) {
      const {name, path} = digs(routeDefinition, "name", "path")
      const rawPathParts = path.split("/")
      const methodName = `${inflection.camelize(name, true)}Path`

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
            } else {
              localizedPathParts.push({type: "pathPart", name: dig(this.routeTranslationParts, locale, pathPart) || pathPart})
            }
          }

          localizedRoutes[locale] = localizedPathParts
        }

        this[methodName] = (...args) => this.translateRoute({args, localizedRoutes})
      } else {
        const pathParts = rawPathParts.map((pathPart) => {
          const variableMatch = pathPart.match(/^:([A-z_]+)$/)

          if (variableMatch) {
            return {type: "variable", count: variableCount}
          } else {
            return {type: "pathPart", name: pathPart}
          }
        })

        this[methodName] = (...args) => this.translateRoute({args, pathParts})
      }
    }
  }

  loadRouteTranslations(i18n) {
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

  translateRoute({args, localizedRoutes, pathParts}) {
    let locale, options

    // Extract options from args if any
    if (typeof args[args.length - 1] == "object") {
      options = args.pop()
    }

    // Take locale from options if given or fall back to fallback
    if (options && options.locale) {
      locale = options.locale
    } else {
      locale = this.getLocale()
    }

    if (localizedRoutes) {
      // Put together route with variables and static translated parts (which were translated and cached previously)
      const translatedRoute = digg(localizedRoutes, locale)
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

      return translatedRoute
    } else if (pathParts) {
      throw new Error("Missing support for un-translated routes")
    }

    throw new Error("Unhandled state")
  }
}
