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

  const reactRoot = document.querySelector(".react-root")
  const routes = ResourceRoutes.readRoutes({
    context: require.context("components", true, /\.jsx$/),
    path: "components",
    routes: require("./routes.json")
  })

  ReactDOM.render((
    <Router history={ApplicationHistory}>
      <ScrollToTop>
        {routes}
      </ScrollToTop>
    </Router>
  ), reactRoot)
})
