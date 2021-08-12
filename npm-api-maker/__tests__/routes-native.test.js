const RoutesNative = require("../src/routes-native.cjs")
const testRoutes = {
  routes: [
    {"name": "blank", "path": "/blank", "component": "blank"},

    {"name": "root", "path": "", "component": "dashboard"},

    {"name": "new_drink", "path": "/drinks/new", "component": "drinks/edit"},
    {"name": "edit_drink", "path": "/drinks/:id/edit", "component": "drinks/edit"},
    {"name": "drink", "path": "/drinks/:id", "component": "drinks/show"},
    {"name": "drinks", "path": "/drinks", "component": "drinks/index"}
  ]
}
const testTranslations = {
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
}

let currentLocale = "en"

const routesNative = ({args}) => {
  const test = new RoutesNative({
    getLocale: () => currentLocale
  })

  test.loadRouteTranslations(testTranslations)
  test.loadRouteDefinitions(testRoutes, args)

  return test
}

describe("RoutesNative", () => {
  it("translates routes from the current locale", () => {
    currentLocale = "da"

    const test = routesNative({args: {localized: true}})
    const daRoute = test.editDrinkPath(5)

    expect(daRoute).toEqual("/da/drinks/5/rediger")
  })

  it("translates routes from the locale-param", () => {
    currentLocale = "en"

    const test = routesNative({args: {localized: true}})
    const daRoute = test.editDrinkPath(5, {locale: "da"})

    expect(daRoute).toEqual("/da/drinks/5/rediger")
  })

  it("defaults to the locale given by the getLocale callback", () => {
    currentLocale = "en"

    const test = routesNative({args: {localized: true}})
    const daRoute = test.editDrinkPath(5)

    expect(daRoute).toEqual("/en/drinks/5/edit")
  })

  it("uses the rest of the params as a query string", () => {
    currentLocale = "en"

    const test = routesNative({args: {localized: true}})
    const daRoute = test.editDrinkPath(5, {drink: {name: "Pina Colada"}, locale: "da"})

    expect(daRoute).toEqual("/da/drinks/5/rediger?drink%5Bname%5D=Pina%20Colada")
  })

  it("translates a route without localization", () => {
    currentLocale = "en"

    const test = routesNative({})
    const daRoute = test.editDrinkPath(5, {drink: {name: "Pina Colada"}})

    expect(daRoute).toEqual("/drinks/5/edit?drink%5Bname%5D=Pina%20Colada")
  })

  it("generates urls", () => {
    currentLocale = "en"

    if (!global.location) global.location = {} // eslint-disable-line jest/no-if

    global.location.host = "localhost"
    global.location.protocol = "http:"

    const test = routesNative({args: {localized: true}})
    const daRoute = test.editDrinkUrl(5, {drink: {name: "Pina Colada"}, locale: "da"})

    expect(daRoute).toEqual("http://localhost/da/drinks/5/rediger?drink%5Bname%5D=Pina%20Colada")
  })

  it("generates urls with custom options", () => {
    currentLocale = "en"

    const test = routesNative({args: {localized: true}})
    const daRoute = test.editDrinkUrl(5, {drink: {name: "Pina Colada"}, locale: "da", host: "google.com", port: 123, protocol: "https"})

    expect(daRoute).toEqual("https://google.com:123/da/drinks/5/rediger?drink%5Bname%5D=Pina%20Colada")
  })
})
