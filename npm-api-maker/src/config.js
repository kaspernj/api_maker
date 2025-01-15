import * as inflection from "inflection"

const accessors = {
  breakPoints: {
    default: [
      ["xxl", 1400],
      ["xl", 1200],
      ["lg", 992],
      ["md", 768],
      ["sm", 576],
      ["xs", 0]
    ],
    required: true
  },
  currenciesCollection: {required: true},
  history: {required: true},
  host: {required: false},
  i18n: {required: false},
  modal: {required: false},
  routes: {required: false},
  routeDefinitions: {required: false}
}

class ApiMakerConfig {
  constructor() {
    if (!globalThis.apiMakerConfigGlobal) globalThis.apiMakerConfigGlobal = {}

    this.global = globalThis.apiMakerConfigGlobal
  }
}

for (const accessorName in accessors) {
  const accessorData = accessors[accessorName]
  const camelizedAccessor = inflection.camelize(accessorName)

  ApiMakerConfig.prototype[`set${camelizedAccessor}`] = function (newValue) { this.global[accessorName] = newValue }
  ApiMakerConfig.prototype[`get${camelizedAccessor}`] = function (...args) {
    if (!this.global[accessorName]) {
      if (accessorData.default) return accessorData.default
      if (accessorData.required) throw new Error(`${accessorName} hasn't been set`)
    }

    const value = this.global[accessorName]

    if (typeof value == "function") return value(...args)

    return value
  }
}

const apiMakerConfig = new ApiMakerConfig()

export default apiMakerConfig
