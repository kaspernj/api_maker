class ApiMakerConfig {
  getCurrenciesCollection() {
    if (!this._currenciesCollection) throw new Error("Currencies collection hasn't been set")

    return this._currenciesCollection
  }

  setCurrenciesCollection(newCurrenciesCollection) {
    this._currenciesCollection = newCurrenciesCollection
  }
}

const apiMakerConfig = new ApiMakerConfig()

export default apiMakerConfig
