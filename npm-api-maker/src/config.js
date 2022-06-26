import inflection from "inflection"

const accessors = {
  breakPoints: {required: true},
  currenciesCollection: {required: true},
  history: {required: false},
  host: {required: false},
  routes: {required: false},
  routeDefinitions: {required: false}
}

class ApiMakerConfig {
  constructor() {
    if (!global.apiMakerConfigGlobal) global.apiMakerConfigGlobal = {}

    this.global = global.apiMakerConfigGlobal
  }
}

for (const accessorName in accessors) {
  const accessorData = accessors[accessorName]
  const camelizedAccessor = inflection.camelize(accessorName)

  ApiMakerConfig.prototype[`set${camelizedAccessor}`] = function (newValue) { this.global[accessorName] = newValue }
  ApiMakerConfig.prototype[`get${camelizedAccessor}`] = function (...args) {
    if (accessorData.required && !this.global[accessorName]) throw new Error(`${accessorName} hasn't been set`)

    const value = this.global[accessorName]

    if (typeof value == "function") return value(...args)

    return value
  }
}

const apiMakerConfig = new ApiMakerConfig()

export default apiMakerConfig
