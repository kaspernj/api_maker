const {digg} = require("@kaspernj/object-digger")
const inflection = require("inflection")

module.exports = class ApiMakerRoutes {
  constructor({jsRoutes, routeDefinitions}) {
    this.jsRoutes = jsRoutes
    this.routeDefinitions = routeDefinitions

    for (const routeDefinition of digg(this, "routeDefinitions", "routes")) {
      const routeNamePath = inflection.camelize(`${digg(routeDefinition, "name")}_path`, true)

      if (!(routeNamePath in this.jsRoutes)) {
        console.log(this.jsRoutes)
        throw new Error(`No such path in JS routes: ${routeNamePath}`)
      }

      this[routeNamePath] = (...args) => {
        return this.jsRoutes[routeNamePath](...args)
      }

      const routeNameUrl = inflection.camelize(`${digg(routeDefinition, "name")}_url`, true)

      if (!(routeNameUrl in this.jsRoutes)) {
        throw new Error(`No such URL in JS routes: ${routeNameUrl}`)
      }

      this[routeNameUrl] = (...args) => {
        return this.jsRoutes[routeNameUrl](...args)
      }
    }
  }
}
