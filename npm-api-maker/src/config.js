class ApiMakerConfig {
  constructor() {
    if (!global.apiMakerConfigGlobal) global.apiMakerConfigGlobal = {}

    this.global = global.apiMakerConfigGlobal
  }

  getCurrenciesCollection() {
    if (!this.global.currenciesCollection) throw new Error("Currencies collection hasn't been set")

    return this.global.currenciesCollection
  }

  setCurrenciesCollection(newCurrenciesCollection) {
    this.global.currenciesCollection = newCurrenciesCollection
  }
}

const apiMakerConfig = new ApiMakerConfig()

export default apiMakerConfig
