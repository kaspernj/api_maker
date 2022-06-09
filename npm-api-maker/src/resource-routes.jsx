const {digg} = require("diggerize")
const React = require("react")
const ResourceRoute = require("./resource-route.cjs")
const {Route, useParams} = require("react-router-dom")

const withRouter = (WrappedComponent) => (props) => {
  const params = useParams()

  return (
    <WrappedComponent
      {...props}
      match={{params}}
    />
  )
}

export default class ApiMakerResourceRoutes {
  static readRoutes ({jsRoutes, locales, requireComponent, routeDefinitions}) {
    if (!routeDefinitions)
      throw new Error("Please pass 'routeDefinitions' to this method")

    const routes = []

    for (const routeDefinition of routeDefinitions.routes) {
      const resourceRoute = new ResourceRoute({jsRoutes, locales, requireComponent, routeDefinition})

      for (const newRoute of resourceRoute.routesResult()) {
        const RouteComponent = withRouter(digg(newRoute, "component"))

        routes.push(
          <Route
            element={<RouteComponent />}
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
