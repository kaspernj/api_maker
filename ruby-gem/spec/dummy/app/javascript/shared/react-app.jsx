import ApplicationHistory from "shared/application-history"
import {createRoot} from "react-dom/client"
import React from "react"
import Router from "@kaspernj/api-maker/src/router"

document.addEventListener("DOMContentLoaded", () => {
  const reactRoot = document.querySelector(".react-root")
  const requireComponent = ({routeDefinition}) => React.lazy(() => import(/* webpackChunkName: "[request]" */ `routes/${routeDefinition.component}`)),
  const routeDefinitions = require("./route-definitions.json")
  const root = createRoot(reactRoot)

  root.render(
    <Router
      history={ApplicationHistory}
      requireComponent={requireComponent}
      routes={Routes}
      routeDefinitions={routeDefinitions}
    />
  )
})
