import ApiMakerConfig from "@kaspernj/api-maker/build/config"
import ApplicationHistory from "shared/application-history"
import {createRoot} from "react-dom/client"
import {Container as Notifications} from "flash-notifications"
import React from "react"
import Router from "@kaspernj/api-maker/build/router"
import Routes from "shared/routes"

const NotFoundComponent = () => <div>Not found</div>
const requireComponent = ({routeDefinition}) => React.lazy(() => import(/* webpackChunkName: "[request]" */ `routes/${routeDefinition.component}`))
import routeDefinitions from "./route-definitions.json"

ApiMakerConfig.setRoutes(Routes)
ApiMakerConfig.setRouteDefinitions(routeDefinitions)

document.addEventListener("DOMContentLoaded", () => {
  const reactRoot = document.querySelector(".react-root")
  const root = createRoot(reactRoot)

  root.render(
    <>
      <Notifications />
      <Router
        history={ApplicationHistory}
        notFoundComponent={NotFoundComponent}
        requireComponent={requireComponent}
        routes={Routes}
        routeDefinitions={routeDefinitions}
      />
    </>
  )
})
