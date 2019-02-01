import ResourceRoute from "./resource-route"
import { Route } from "react-router-dom"

export default class ApiMakerResourceRoutes {
  static readRoutes(args = {}) {
    var routesJson = require("shared/routes.json")
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
