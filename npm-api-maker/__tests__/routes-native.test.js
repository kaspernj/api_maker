import RoutesNative from "../build/routes-native.js"

const testRoutes = () => ({
  routes: [
    {"name": "blank", "path": "/blank", "component": "blank"},

    {"name": "root", "path": "", "component": "dashboard"},

    {"name": "new_drink", "path": "/drinks/new", "component": "drinks/edit"},
    {"name": "edit_drink", "path": "/drinks/:id/edit", "component": "drinks/edit"},
    {"name": "drink", "path": "/drinks/:id", "component": "drinks/show"},
    {"name": "drinks", "path": "/drinks", "component": "drinks/index"}
  ]
})
const testTranslations = () => ({
  locales: {
    da: {
      routes: {
        drink: "drink",
        edit: "rediger"
      }
    },
    en: {
      routes: {
        drink: "drink",
        edit: "edit"
      }
    }
  }
})

const routesNative = ({args, currentLocale}) => {
  const test = new RoutesNative({
    getLocale: () => currentLocale
  })

  test.loadRouteTranslations(testTranslations())
  test.loadRouteDefinitions(testRoutes(), args)

  return test
}

describe("RoutesNative", () => {
  it("translates routes from the current locale", () => {
    const test = routesNative({args: {localized: true}, currentLocale: "da"})
    const daRoute = test.editDrinkPath(5)

    expect(daRoute).toEqual("/da/drinks/5/rediger")
  })

  it("translates routes from the locale-param", () => {
    const test = routesNative({args: {localized: true}, currentLocale: "en"})
    const daRoute = test.editDrinkPath(5, {locale: "da"})

    expect(daRoute).toEqual("/da/drinks/5/rediger")
  })

  it("defaults to the locale given by the getLocale callback", () => {
    const test = routesNative({args: {localized: true}, currentLocale: "en"})
    const daRoute = test.editDrinkPath(5)

    expect(daRoute).toEqual("/en/drinks/5/edit")
  })

  it("uses the rest of the params as a query string", () => {
    const test = routesNative({args: {localized: true}, currentLocale: "en"})
    const daRoute = test.editDrinkPath(5, {drink: {name: "Pina Colada"}, locale: "da"})

    expect(daRoute).toEqual("/da/drinks/5/rediger?drink%5Bname%5D=Pina%20Colada")
  })

  it("translates a route without localization", () => {
    const test = routesNative({currentLocale: "en"})
    const daRoute = test.editDrinkPath(5, {drink: {name: "Pina Colada"}})

    expect(daRoute).toEqual("/drinks/5/edit?drink%5Bname%5D=Pina%20Colada")
  })

  it("generates urls", () => {
    if (!globalThis.location) globalThis.location = {} // eslint-disable-line jest/no-if

    globalThis.location.host = "localhost"
    globalThis.location.protocol = "http:"

    const test = routesNative({args: {localized: true}, currentLocale: "en"})
    const daRoute = test.editDrinkUrl(5, {drink: {name: "Pina Colada"}, locale: "da"})

    expect(daRoute).toEqual("http://localhost/da/drinks/5/rediger?drink%5Bname%5D=Pina%20Colada")
  })

  it("generates urls with custom options", () => {
    const test = routesNative({args: {localized: true}, currentLocale: "en"})
    const daRoute = test.editDrinkUrl(5, {drink: {name: "Pina Colada"}, locale: "da", host: "google.com", port: 123, protocol: "https"})

    expect(daRoute).toEqual("https://google.com:123/da/drinks/5/rediger?drink%5Bname%5D=Pina%20Colada")
  })

  it("generates urls without locales", () => {
    const test = routesNative({currentLocale: "en"})
    const daRoute = test.editDrinkUrl(5, {drink: {name: "Pina Colada"}, locale: "da", host: "google.com", port: 123, protocol: "https"})

    expect(daRoute).toEqual("https://google.com:123/drinks/5/edit?drink%5Bname%5D=Pina%20Colada")
  })
})
