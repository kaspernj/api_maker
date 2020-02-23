import React from "react" // This fixes an issue with the Baristo project where it needed it to be loaded
import ResourceRoute from "./resource-route"
import { Route } from "react-router-dom"

export default class ApiMakerResourceRoutes {
  static readRoutes(args = {}) {
    if (!args.routes)
      throw new Error("Please pass 'routes' to this method")

    const routesJson = args.routes
    const routes = []

    for(const route of routesJson.routes) {
      const resourceRoute = new ResourceRoute({args, route})

      for(const newRoute of resourceRoute.routes()) {
        routes.push(
          <Route exact key={`route-${newRoute.path}`} path={newRoute.path} component={newRoute.component} />
        )
      }
    }

    return routes
  }
}
