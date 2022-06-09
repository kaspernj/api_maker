import ApplicationHistory from "shared/application-history"
import {BrowserRouter, Routes as ReactRouterDomRoutes} from "react-router-dom"
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
    <BrowserRouter history={ApplicationHistory}>
      <Suspense fallback={<div>Loading...</div>}>
        <ReactRouterDomRoutes>
          {routes}
        </ReactRouterDomRoutes>
      </Suspense>
    </BrowserRouter>
  ), reactRoot)
})
