import I18nOnSteroids from "i18n-on-steroids"
import routeDefinitions from "shared/route-definitions.json"
import RoutesNative from "@kaspernj/api-maker/dist/routes-native"

const i18n = I18nOnSteroids.getCurrent()
const routes = new RoutesNative({
  getLocale: () => I18n.locale
})

routes.loadRouteTranslations(i18n)
routes.loadRouteDefinitions(routeDefinitions, {localized: false})

export default routes
