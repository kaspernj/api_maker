import ApplicationHistory from "shared/application-history"
import {createRoot} from "react-dom/client"
import React from "react"
import Router from "@kaspernj/api-maker/src/router"
import withPathname from "on-location-changed/src/with-path"

const NotFoundComponent = () => <div>Not found</div>

document.addEventListener("DOMContentLoaded", () => {
  const reactRoot = document.querySelector(".react-root")
  const requireComponent = ({routeDefinition}) => React.lazy(() => import(/* webpackChunkName: "[request]" */ `routes/${routeDefinition.component}`))
  const routeDefinitions = require("./route-definitions.json")
  const root = createRoot(reactRoot)
  const RouterWithLocation = withPathname(Router)

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
