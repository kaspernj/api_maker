import {Routes as jsRoutes} from "shared/js-routes"
import routeDefinitions from "shared/route-definitions.json"
import {Routes} from "@kaspernj/api-maker"

const routes = new Routes({jsRoutes, routeDefinitions})

export default routes
