const {digg} = require("@kaspernj/object-digger")
const inflection = require("inflection")

export default class ApiMakerRoutes {
  constructor({jsRoutes, routeDefinitions}) {
    this.jsRoutes = jsRoutes
    this.routeDefinitions = routeDefinitions

    for (const routeDefinition of digg(this, "routeDefinitions", "routes")) {
      const routeNamePath = inflection.camelize(`${digg(routeDefinition, "name")}_path`, true)

      this[routeNamePath] = (...args) => {
        return this.jsRoutes[routeNamePath](...args)
      }

      const routeNameUrl = inflection.camelize(`${digg(routeDefinition, "name")}_url`, true)

      this[routeNameUrl] = (...args) => {
        return this.jsRoutes[routeNameUrl](...args)
      }
    }
  }
}
