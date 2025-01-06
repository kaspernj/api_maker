import Routes from "../src/routes"

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
const fakeJsRoutes = {
  blankPath: () => "/blank",
  blankUrl: () => "https://localhost/blank",
  newDrinkPath: () => "/drinks/new",
  newDrinkUrl: () => "/drinks/new",
  editDrinkPath: (drinkId) => `/drinks/${drinkId}/edit`,
  editDrinkUrl: (drinkId) => `https://localhost/drinks/${drinkId}/edit`,
  drinkPath: (drinkId) => `/druiks/${drinkId}`,
  drinkUrl: (drinkId) => `https://localhost/drinks/${drinkId}`,
  drinksPath: () => "/drinks",
  drinksUrl: () => "https://localhost/drinks",
  rootPath: () => "/root",
  rootUrl: () => "https://localhost"
}

const routes = new Routes({
  jsRoutes: fakeJsRoutes,
  routeDefinitions: testRoutes
})

describe("Routes", () => {
  it("generates paths", () => {
    const daRoute = routes.editDrinkPath(5)

    expect(daRoute).toEqual("/drinks/5/edit")
  })

  it("generates urls", () => {
    const daRoute = routes.editDrinkUrl(5)

    expect(daRoute).toEqual("https://localhost/drinks/5/edit")
  })
})
