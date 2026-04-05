import {EventEmitter} from "eventemitter3"
import * as inflection from "inflection" // eslint-disable-line sort-imports

const accessors = {
  breakpoints: {
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
  cableUrl: {require: false},
  currenciesCollection: {required: true},
  history: {required: true},
  host: {required: false},
  i18n: {required: false},
  linkTo: {required: true},
  modal: {required: false},
  navigation: {required: true},
  routes: {required: false},
  routeDefinitions: {required: false},
  useHtmlForm: {default: true, required: false},
  websocketRequests: {required: false}
}

/** ApiMakerConfig. */
class ApiMakerConfig {
  /** Constructor. */
  constructor() {
    if (!globalThis.apiMakerConfigGlobal) globalThis.apiMakerConfigGlobal = {}

    this.global = globalThis.apiMakerConfigGlobal
    this.events = new EventEmitter()
  }

  /** getEvents. */
  getEvents() { return this.events }

  /** @returns {import("history").BrowserHistory} */
  getHistory() { throw new Error("'getHistory' not implemented") }

  /** @returns {string} */
  getHost() { throw new Error("'getHost' not implemented") }

  /** @returns {string | undefined} */
  getCableUrl() { throw new Error("'getCableUrl' not implemented") }

  /**
   * @param {string | undefined} _newValue
   * @returns {void}
   */
  setCableUrl(_newValue) { throw new Error("'setCableUrl' not implemented") }

  /** @returns {boolean | undefined} */
  getWebsocketRequests() { throw new Error("'getWebsocketRequests' not implemented") }

  /**
   * @param {boolean | undefined} _newValue
   * @returns {void}
   */
  setWebsocketRequests(_newValue) { throw new Error("'setWebsocketRequests' not implemented") }

  /** @returns {any} */
  getCurrenciesCollection() { throw new Error("'getCurrenciesCollection' not implemented") }

  /** @returns {any} */
  getModal() { throw new Error("'getModal' not implemented") }

  /** @returns {Record<string, any>} */
  getRouteDefinitions() { throw new Error("'getRouteDefinitions' not implemented") }

  /** @returns {Record<string, any>} */
  getRoutes() { throw new Error("'getRoutes' not implemented") }
}

for (const accessorName in accessors) {
  const accessorData = accessors[accessorName]
  const camelizedAccessor = inflection.camelize(accessorName)

  ApiMakerConfig.prototype[`set${camelizedAccessor}`] = function (newValue) {
    const oldValue = this.global[accessorName]

    this.global[accessorName] = newValue

    if (oldValue !== newValue) {
      this.events.emit(`on${camelizedAccessor}Change`, {oldValue, newValue})
    }
  }

  ApiMakerConfig.prototype[`get${camelizedAccessor}`] = function (...args) {
    if (this.global[accessorName] === undefined) {
      if (accessorData.default !== undefined) return accessorData.default
      if (accessorData.required) throw new Error(`${accessorName} hasn't been set`)
    }

    const value = this.global[accessorName]

    if (typeof value == "function") return value(...args)

    return value
  }
}

const apiMakerConfig = new ApiMakerConfig()

export default apiMakerConfig
