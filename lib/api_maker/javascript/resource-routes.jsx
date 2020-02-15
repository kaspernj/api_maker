import React from "react" // This fixes an issue with the Baristo project where it needed it to be loaded
import ResourceRoute from "./resource-route"
import { Route } from "react-router-dom"

export default class ApiMakerResourceRoutes {
  static readRoutes(args = {}) {
    if (!args.routes)
      throw new Error("Please pass 'routes' to this method")

    const parsedContext = ApiMakerResourceRoutes.parseContext(args)
    const routesJson = args.routes
    const routes = []

    for(const route of routesJson.routes) {
      const resourceRoute = new ResourceRoute({args, parsedContext, route})

      for(const newRoute of resourceRoute.routes()) {
        routes.push(
          <Route exact key={`route-${newRoute.path}`} path={newRoute.path} component={newRoute.component} />
        )
      }
    }

    return routes
  }

  static parseContext(args) {
    const result = {}
    args.context.keys().forEach(key => {
      const newKey = `${args.path}/${key.substring(2, key.length)}`
      result[newKey] = args.context(key)
    })

    return result
  }
}
