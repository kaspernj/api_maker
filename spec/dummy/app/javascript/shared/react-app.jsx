import ApplicationHistory from "shared/application-history"
import ErrorLogger from "api-maker/error-logger"
import { Router, Route } from "react-router-dom"
import React from "react"
import ReactDOM from "react-dom"
import ResourceRoutes from "api-maker/resource-routes"
import ScrollToTop from "shared/scroll-to-top"
import {Suspense} from "react"

document.addEventListener("DOMContentLoaded", () => {
  window.errorLogger = new ErrorLogger()
  window.errorLogger.enable()

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
