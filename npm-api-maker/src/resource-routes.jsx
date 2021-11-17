const {digg} = require("diggerize")
const React = require("react")
const ResourceRoute = require("./resource-route.cjs")
const {Route} = require("react-router-dom")

export default class ApiMakerResourceRoutes {
  static readRoutes ({jsRoutes, locales, requireComponent, routeDefinitions}) {
    if (!routeDefinitions)
      throw new Error("Please pass 'routeDefinitions' to this method")

    const routes = []

    for (const routeDefinition of routeDefinitions.routes) {
      const resourceRoute = new ResourceRoute({jsRoutes, locales, requireComponent, routeDefinition})

      for (const newRoute of resourceRoute.routesResult()) {
        routes.push(
          <Route
            component={digg(newRoute, "component")}
            exact
            key={`route-${digg(newRoute, "path")}`}
            path={digg(newRoute, "path")}
          />
        )
      }
    }

    return routes
  }
}
