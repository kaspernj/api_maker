import {default as ApiMakerConfig} from "@kaspernj/api-maker/build/config"
import ApplicationHistory from "shared/application-history"
import {createRoot} from "react-dom/client"
import React from "react"
import Router from "@kaspernj/api-maker/build/router"
import Routes from "shared/routes"
import withPathname from "on-location-changed/src/with-path"

const NotFoundComponent = () => <div>Not found</div>
const requireComponent = ({routeDefinition}) => React.lazy(() => import(/* webpackChunkName: "[request]" */ `routes/${routeDefinition.component}`))
import routeDefinitions from "./route-definitions.json"
const RouterWithLocation = withPathname(Router)

ApiMakerConfig.setRoutes(Routes)
ApiMakerConfig.setRouteDefinitions(routeDefinitions)

document.addEventListener("DOMContentLoaded", () => {
  const reactRoot = document.querySelector(".react-root")
  const root = createRoot(reactRoot)

  root.render(
    <RouterWithLocation
      history={ApplicationHistory}
      notFoundComponent={NotFoundComponent}
      requireComponent={requireComponent}
      routes={Routes}
      routeDefinitions={routeDefinitions}
    />
  )
})
