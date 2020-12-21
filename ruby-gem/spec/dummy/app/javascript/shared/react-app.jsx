import ApplicationHistory from "shared/application-history"
import { Router } from "react-router-dom"
import React from "react"
import ReactDOM from "react-dom"
import {ResourceRoutes} from "@kaspernj/api-maker"
import ScrollToTop from "shared/scroll-to-top"
import {Suspense} from "react"

document.addEventListener("DOMContentLoaded", () => {
  const reactRoot = document.querySelector(".react-root")
  const routes = ResourceRoutes.readRoutes({
    path: "",
    routes: require("./routes.json")
  })

  ReactDOM.render((
    <Router history={ApplicationHistory}>
      <Suspense fallback={<div>Loading...</div>}>
        <ScrollToTop>
          {routes}
        </ScrollToTop>
      </Suspense>
    </Router>
  ), reactRoot)
})
