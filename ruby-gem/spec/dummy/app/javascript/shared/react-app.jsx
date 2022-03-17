import ApplicationHistory from "shared/application-history"
import { Router } from "react-router-dom"
import React from "react"
import ReactDOM from "react-dom"
import ResourceRoutes from "@kaspernj/api-maker/src/resource-routes"
import {Suspense} from "react"

document.addEventListener("DOMContentLoaded", () => {
  const reactRoot = document.querySelector(".react-root")
  const routes = ResourceRoutes.readRoutes({
    jsRoutes: Routes,
    path: "",
    requireComponent: ({routeDefinition}) => React.lazy(() => import(/* webpackChunkName: "[request]" */ `routes/${routeDefinition.component}`)),
    routeDefinitions: require("./route-definitions.json")
  })

  ReactDOM.render((
    <Router history={ApplicationHistory}>
      <Suspense fallback={<div>Loading...</div>}>
        {routes}
      </Suspense>
    </Router>
  ), reactRoot)
})
