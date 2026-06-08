// @ts-check
import {EventEmitter} from "eventemitter3"
import * as inflection from "inflection" // eslint-disable-line sort-imports

/** @typedef {[name: string, minWidth: number]} BreakpointDefinition */
/** @typedef {[label: string, code: string]} CurrencyOption */
/** @typedef {Record<string, object>} RouteMap */
/** @typedef {{routes: Array<{name: string, path: string}>}} RouteDefinitions */
/**
 * @typedef {{emit: (eventName: string, payload: {oldValue: ConfigValue, newValue: ConfigValue}) => void}} ConfigEvents
 */
/**
 * @typedef {BreakpointDefinition[] | CurrencyOption[] | RouteMap | RouteDefinitions | EventEmitter |
 *   boolean | number | object | string | undefined} ConfigValue
 */

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
  dangerousRowCountThreshold: {default: 1000, required: false},
  history: {required: true},
  host: {required: false},
  i18n: {required: false},
  linkTo: {required: true},
  modal: {required: false},
  navigation: {required: true},
  routes: {required: false},
  routeDefinitions: {required: false},
  useHtmlForm: {default: false, required: false},
  websocketRequests: {required: false}
}

/**
 * @param {string} methodName
 * @returns {never}
 */
const apiMakerConfigNotImplemented = (methodName) => {
  throw new Error(`'${methodName}' not implemented`)
}

/** Stores globally configured Api Maker integration hooks and runtime dependencies. */
class ApiMakerConfig {
  /** Initializes the shared config state and change emitter. */
  constructor() {
    if (!globalThis.apiMakerConfigGlobal) globalThis.apiMakerConfigGlobal = {}

    this.global = globalThis.apiMakerConfigGlobal
    this.events = new EventEmitter()
  }

  /**
   * Returns the event emitter used for config change notifications.
   * @returns {ConfigEvents}
   */
  getEvents() { return this.events }

  /** @returns {import("history").BrowserHistory} */
  getHistory() {
    return apiMakerConfigNotImplemented("getHistory")
  }

  /** @returns {string} */
  getHost() {
    return apiMakerConfigNotImplemented("getHost")
  }

  /** @returns {string | undefined} */
  getCableUrl() {
    return apiMakerConfigNotImplemented("getCableUrl")
  }

  /** @returns {number} */
  getDangerousRowCountThreshold() {
    return apiMakerConfigNotImplemented("getDangerousRowCountThreshold")
  }

  /**
   * @param {number} _newValue
   */
  setDangerousRowCountThreshold(_newValue) { apiMakerConfigNotImplemented("setDangerousRowCountThreshold") }

  /**
   * @param {string | undefined} _newValue
   */
  setCableUrl(_newValue) { apiMakerConfigNotImplemented("setCableUrl") }

  /** @returns {boolean | undefined} */
  getWebsocketRequests() {
    return apiMakerConfigNotImplemented("getWebsocketRequests")
  }

  /**
   * @param {boolean | undefined} _newValue
   */
  setWebsocketRequests(_newValue) { apiMakerConfigNotImplemented("setWebsocketRequests") }

  /** @returns {Array<CurrencyOption>} */
  getCurrenciesCollection() {
    return apiMakerConfigNotImplemented("getCurrenciesCollection")
  }

  /** @returns {object} */
  getModal() {
    return apiMakerConfigNotImplemented("getModal")
  }

  /** @returns {RouteDefinitions} */
  getRouteDefinitions() {
    return apiMakerConfigNotImplemented("getRouteDefinitions")
  }

  /** @returns {RouteMap} */
  getRoutes() {
    return apiMakerConfigNotImplemented("getRoutes")
  }

  /** @returns {boolean} */
  getUseHtmlForm() {
    return apiMakerConfigNotImplemented("getUseHtmlForm")
  }

  /**
   * @param {boolean} _newValue
   */
  setUseHtmlForm(_newValue) { apiMakerConfigNotImplemented("setUseHtmlForm") }
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
