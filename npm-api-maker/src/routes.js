const {digg} = require("@kaspernj/object-digger")
const inflection = require("inflection")

export default class ApiMakerRoutes {
  constructor({jsRoutes, routeDefinitions}) {
    this.jsRoutes = jsRoutes
    this.routeDefinitions = routeDefinitions

    for (const routeDefinition of digg(this, "routeDefinitions", "routes")) {
      const routeName = inflection.camelize(`${digg(routeDefinition, "name")}_path`, true)

      this[routeName] = (...args) => {
        return this.jsRoutes[routeName](...args)
      }
    }
  }
}
