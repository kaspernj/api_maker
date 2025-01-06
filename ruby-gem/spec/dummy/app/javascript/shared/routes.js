import routeDefinitions from "shared/route-definitions.json"
import RoutesNative from "@kaspernj/api-maker/build/routes-native"

const routes = new RoutesNative({
  getLocale: () => I18n.locale
})

routes.loadRouteTranslations(I18n)
routes.loadRouteDefinitions(routeDefinitions, {localized: false})

export default routes
