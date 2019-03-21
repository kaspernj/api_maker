import ApplicationHistory from "shared/application-history"
import ErrorLogger from "api-maker/error-logger"
import { Router, Route } from "react-router-dom"
import React from "react"
import ReactDOM from "react-dom"
import ResourceRoutes from "api-maker/resource-routes"
import ScrollToTop from "shared/scroll-to-top"

document.addEventListener("DOMContentLoaded", () => {
  window.errorLogger = new ErrorLogger()
  window.errorLogger.loadSourceMaps().then(() => {
    window.errorLogger.enable()
  })

  var reactRoot = document.querySelector(".react-root")
  var routes = ResourceRoutes.readRoutes()

  ReactDOM.render((
    <Router history={ApplicationHistory}>
      <ScrollToTop>
        {routes}
      </ScrollToTop>
    </Router>
  ), reactRoot)
})
