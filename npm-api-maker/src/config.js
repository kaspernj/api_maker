class ApiMakerConfig {
  constructor() {
    if (!global.apiMakerConfigGlobal) global.apiMakerConfigGlobal = {}

    this.global = global.apiMakerConfigGlobal
  }

  getCurrenciesCollection() {
    if (!this.global.currenciesCollection) throw new Error("Currencies collection hasn't been set")

    return this.global.currenciesCollection
  }

  getRouteDefinitions() {
    return this.global.routeDefinitions
  }

  getRoutes() {
    return this.global.routes
  }

  setCurrenciesCollection(newCurrenciesCollection) {
    this.global.currenciesCollection = newCurrenciesCollection
  }

  setHistory(history) {
    this.global.history = history
  }

  setRouteDefinitions(routeDefinitions) {
    this.global.routeDefinitions = routeDefinitions
  }

  setRoutes(routes) {
    this.global.routes = routes
  }
}

const apiMakerConfig = new ApiMakerConfig()

export default apiMakerConfig
