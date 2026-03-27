import * as inflection from "inflection" // eslint-disable-line sort-imports
import CableConnectionPool from "./cable-connection-pool.js"
import {createContext} from "react"
import Deserializer from "./deserializer.js" // eslint-disable-line sort-imports
import events from "./events.js"
import modelClassRequire from "./model-class-require.js"
import SessionStatusUpdater from "./session-status-updater.js" // eslint-disable-line sort-imports
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

    // Sign in over HTTP first so Devise can write the real session cookie and
    // remember-me token in the HTTP response.
    const response = await Services.current().sendRequest("Devise::SignIn", postData, {forceHttp: true})

    let model = response.model

    if (Array.isArray(model)) model = model[0]

    await ApiMakerDevise.syncSessionStatusAndRefreshWebsocket({
      httpResponse: response,
      scope: args.scope,
      websocketArgs: {
        rememberMe: args.rememberMe,
        scope: args.scope,
        signedIn: true
      }
    })

    ApiMakerDevise.updateSession(model)

    if (!args.skipSignInEvent) {
      events.emit("onDeviseSignIn", {username, ...args})
    }

    return {model, response}
  }

  /**
   * Synchronizes the current backend auth state into real HTTP response cookies.
   *
   * @param {Record<string, any>} [args]
   * @returns {Promise<any>}
   */
  static async persistSession(args = {}) {
    if (!args.scope) args.scope = "user"

    const response = await Services.current().sendRequest("Devise::PersistSession", args, {forceHttp: true})

    const sessionStatusUpdater = SessionStatusUpdater.current()

    if (response.session_status) {
      sessionStatusUpdater.applyResult(response.session_status)
    } else {
      await sessionStatusUpdater.updateSessionStatus()
    }

    return response
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

    const response = await Services.current().sendRequest("Devise::SignOut", {args}, {forceHttp: true})
    const sessionStatus = await ApiMakerDevise.syncSessionStatusAndRefreshWebsocket({
      httpResponse: response,
      scope: args.scope,
      websocketArgs: {
        scope: args.scope,
        signedIn: false
      }
    })

    if (!sessionStatus.scopes?.[args.scope]?.signed_in) {
      ApiMakerDevise.setSignedOut(args)
      ApiMakerDevise.callSignOutEvent(args)
    }

    return response
  }

  /**
   * Applies the latest HTTP session status locally, then refreshes the
   * existing websocket connection so ApiMaker commands use the same auth.
   *
   * @param {Record<string, any>} args
   * @returns {Promise<Record<string, any>>}
   */
  static async syncSessionStatusAndRefreshWebsocket(args) {
    const sessionStatus = await ApiMakerDevise.syncSessionStatusFromHttpResponse(args.httpResponse)
    const websocketArgs = {
      ...args.websocketArgs,
      shadowSessionToken: sessionStatus.shadow_session_token
    }

    await ApiMakerDevise.refreshWebsocketSession(websocketArgs)
    await ApiMakerDevise.refreshSubscriptionAuthentication(websocketArgs)

    return sessionStatus
  }

  /**
   * @param {Record<string, any>} httpResponse
   * @returns {Promise<Record<string, any>>}
   */
  static async syncSessionStatusFromHttpResponse(httpResponse) {
    const sessionStatusUpdater = SessionStatusUpdater.current()
    const sessionStatus = httpResponse.session_status || await sessionStatusUpdater.sessionStatus()

    sessionStatusUpdater.applyResult(sessionStatus)

    return sessionStatus
  }

  /**
   * Refreshes ApiMaker auth inside the existing websocket connection.
   *
   * @param {Record<string, any>} args
   * @returns {Promise<any>}
   */
  static async refreshWebsocketSession(args) {
    return Services.current().sendRequest("Devise::PersistSession", args)
  }

  /**
   * Refreshes auth on the existing subscriptions channel pools.
   *
   * @param {Record<string, any>} args
   * @returns {Promise<void>}
   */
  static async refreshSubscriptionAuthentication(args) {
    await CableConnectionPool.current().refreshAuthentication(args)
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
