import React from "react" // This fixes an issue with the Baristo project where it needed it to be loaded
import ResourceRoute from "./resource-route"
import { Route } from "react-router-dom"

export default class ApiMakerResourceRoutes {
  static readRoutes(args = {}) {
    if (!args.routes)
      throw new Error("Please pass 'routes' to this method")

    var routesJson = args.routes
    var routes = []

    for(var route of routesJson.routes) {
      var resourceRoute = new ResourceRoute({locales: args.locales, route: route})

      for(var newRoute of resourceRoute.routes()) {
        routes.push(
          <Route exact key={`route-${newRoute.path}`} path={newRoute.path} component={newRoute.component} />
        )
      }
    }

    return routes
  }
}
