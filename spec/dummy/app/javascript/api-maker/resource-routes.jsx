import React from "react" // This fixes an issue with the Baristo project where it needed it to be loaded
import ResourceRoute from "./resource-route"
import { Route } from "react-router-dom"

export default class ApiMakerResourceRoutes {
  static readRoutes(args = {}) {
    if (!args.routes)
      throw new Error("Please pass 'routes' to this method")

    var parsedContext = ApiMakerResourceRoutes.parseContext(args)
    var routesJson = args.routes
    var routes = []

    for(var route of routesJson.routes) {
      var resourceRoute = new ResourceRoute({args, parsedContext, route})

      for(var newRoute of resourceRoute.routes()) {
        routes.push(
          <Route exact key={`route-${newRoute.path}`} path={newRoute.path} component={newRoute.component} />
        )
      }
    }

    return routes
  }

  static parseContext(args) {
    var result = {}
    args.context.keys().forEach(key => {
      var newKey = `${args.path}/${key.substring(2, key.length)}`
      result[newKey] = args.context(key)
    })

    return result
  }
}
