import {createContext} from "react"
import Deserializer from "./deserializer.js" // eslint-disable-line sort-imports
import events from "./events.js"
import * as inflection from "inflection" // eslint-disable-line sort-imports
import modelClassRequire from "./model-class-require.js"
import Services from "./services.js" // eslint-disable-line sort-imports

if (!globalThis.ApiMakerDevise) globalThis.ApiMakerDevise = {scopes: {}}

const shared = globalThis.ApiMakerDevise

/** DeviseScope. */
class DeviseScope {
  /** Constructor. */
  constructor(scope, args) {
    this.args = args
    this.context = createContext(undefined)
    this.scope = scope
  }

  /** getContext. */
  getContext = () => this.context
}

/** ApiMakerDevise. */
export default class ApiMakerDevise {
  /** callSignOutEvent. */
  static callSignOutEvent(args) {
    events.emit("onDeviseSignOut", {args})
  }

  /** @returns {ApiMakerDevise} */
  static current() {
    if (!shared.currentApiMakerDevise) {
      shared.currentApiMakerDevise = new ApiMakerDevise()
    }

    return shared.currentApiMakerDevise
  }

  /** events. */
  static events() {
    return events
  }

  /** addUserScope. */
  static addUserScope(scope, args = {}) {
    const scopeCamelized = inflection.camelize(scope)
    const currentMethodName = `current${scopeCamelized}`
    const isSignedInMethodName = `is${scopeCamelized}SignedIn`
    const getArgsMethodName = `get${scopeCamelized}Args`
    const getScopeName = `get${scopeCamelized}Scope`
    const scopeInstance = new DeviseScope(scope, args)

    ApiMakerDevise[currentMethodName] = () => ApiMakerDevise.current().getCurrentScope(scope)
    ApiMakerDevise[isSignedInMethodName] = () => Boolean(ApiMakerDevise.current().getCurrentScope(scope))
    ApiMakerDevise[getArgsMethodName] = () => args
    ApiMakerDevise[getScopeName] = () => scopeInstance
  }

  /** getScope. */
  static getScope(scope) {
    const scopeCamelized = inflection.camelize(scope)
    const getScopeName = `get${scopeCamelized}Scope`

    return ApiMakerDevise[getScopeName]()
  }

  static async signIn(username, password, args = {}) {
    if (!args.scope) args.scope = "user"

    const postData = {username, password, args}
    const response = await Services.current().sendRequest("Devise::SignIn", postData)

    let model = response.model

    if (Array.isArray(model)) model = model[0]

    ApiMakerDevise.updateSession(model)
    events.emit("onDeviseSignIn", {username, ...args})

    return {model, response}
  }

  /** updateSession. */
  static updateSession(model, args = {}) {
    if (!args.scope) args.scope = "user"

    const camelizedScopeName = inflection.camelize(args.scope, true)

    ApiMakerDevise.current().currents[camelizedScopeName] = model
  }

  /** hasCurrentScope. */
  hasCurrentScope(scope) {
    const camelizedScopeName = inflection.camelize(scope, true)

    return camelizedScopeName in ApiMakerDevise.current().currents
  }

  /** setSignedOut. */
  static setSignedOut(args) {
    ApiMakerDevise.current().currents[inflection.camelize(args.scope, true)] = null
  }

  static async signOut(args = {}) {
    if (!args.scope) {
      args.scope = "user"
    }

    const response = await Services.current().sendRequest("Devise::SignOut", {args})
    ApiMakerDevise.setSignedOut(args)
    ApiMakerDevise.callSignOutEvent(args)

    // Cannot use the class because they would both import each other
    if (shared.apiMakerSessionStatusUpdater) {
      shared.apiMakerSessionStatusUpdater.updateSessionStatus()
    }

    return response
  }

  /** Constructor. */
  constructor() {
    this.currents = {}
  }

  /** getCurrentScope. */
  getCurrentScope(scope) {
    if (!(scope in this.currents)) {
      this.currents[scope] = this.loadCurrentScope(scope)
    }

    return this.currents[scope]
  }

  /** hasGlobalCurrentScope. */
  hasGlobalCurrentScope(scope) {
    if (globalThis.apiMakerDeviseCurrent && scope in globalThis.apiMakerDeviseCurrent) {
      return true
    }

    return false
  }

  /** loadCurrentScope. */
  loadCurrentScope(scope) {
    if (!this.hasGlobalCurrentScope(scope)) {
      return null
    }

    const scopeData = globalThis.apiMakerDeviseCurrent[scope]

    if (!scopeData) return null

    const parsedScopeData = Deserializer.parse(scopeData)

    // Might be a collection with preloaded relationships
    if (Array.isArray(parsedScopeData)) return parsedScopeData[0]

    const ModelClass = modelClassRequire(scope)
    const modelInstance = new ModelClass({data: parsedScopeData})

    return modelInstance
  }
}
