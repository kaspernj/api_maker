// @ts-check
import * as inflection from "inflection" // eslint-disable-line sort-imports
import CableConnectionPool from "./cable-connection-pool.js"
import {createContext} from "react"
import Deserializer from "./deserializer.js" // eslint-disable-line sort-imports
import events from "./events.js"
import modelClassRequire from "./model-class-require.js"
import SessionStatusUpdater from "./session-status-updater.js" // eslint-disable-line sort-imports
import Services from "./services.js" // eslint-disable-line sort-imports

/** @typedef {{scopes?: Record<string, boolean>, currentApiMakerDevise?: ApiMakerDevise}} ApiMakerDeviseShared */
/** @typedef {{signed_in: boolean}} DeviseSessionStatusScope */
/**
 * @typedef {object} DeviseSessionStatusResult
 * @property {string} [csrf_token]
 * @property {Record<string, DeviseSessionStatusScope>} scopes
 * @property {string} [shadow_session_token]
 * @property {DeviseSessionStatusResult} [session_status]
 */
/** @typedef {{rememberMe?: boolean, scope?: string, signedIn?: boolean, skipSignInEvent?: boolean}} DeviseScopeArgs */
/** @typedef {DeviseSessionStatusResult & {model?: import("./base-model.js").default | import("./base-model.js").default[]}} DeviseSignInResponse */
/** @typedef {{httpResponse: DeviseSessionStatusResult, scope: string, websocketArgs: DeviseScopeArgs}} SyncSessionArgs */
/** @typedef {import("./base-model.js").default | null} DeviseCurrentScope */

if (!globalThis.ApiMakerDevise) globalThis.ApiMakerDevise = {scopes: {}}

const shared = /** @type {ApiMakerDeviseShared} */ (globalThis.ApiMakerDevise)

/** DeviseScope. */
class DeviseScope {
  /**
   * Constructor.
   * @param {string} scope
   * @param {DeviseScopeArgs} args
   */
  constructor(scope, args) {
    this.args = args
    this.context = createContext(undefined)
    this.scope = scope
  }

  /** @returns {import("react").Context<DeviseCurrentScope | undefined>} */
  getContext = () => this.context
}

/** ApiMakerDevise. */
export default class ApiMakerDevise {
  /**
   * Emits the shared sign-out event payload for one scope.
   * @param {DeviseScopeArgs} args
   * @returns {void}
   */
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

  /**
   * Returns the shared event emitter used for Devise lifecycle events.
   * @returns {typeof events}
   */
  static events() {
    return events
  }

  /**
   * Registers one Devise scope and its helper accessors.
   * @param {string} scope
   * @param {DeviseScopeArgs} args
   */
  static addUserScope(scope, args = {}) {
    const scopeCamelized = inflection.camelize(scope)
    const currentMethodName = `current${scopeCamelized}`
    const isSignedInMethodName = `is${scopeCamelized}SignedIn`
    const getArgsMethodName = `get${scopeCamelized}Args`
    const getScopeName = `get${scopeCamelized}Scope`
    const scopeInstance = new DeviseScope(scope, args)

    shared.scopes[scope] = true
    ApiMakerDevise[currentMethodName] = () => ApiMakerDevise.current().getCurrentScope(scope)
    ApiMakerDevise[isSignedInMethodName] = () => Boolean(ApiMakerDevise.current().getCurrentScope(scope))
    ApiMakerDevise[getArgsMethodName] = () => args
    ApiMakerDevise[getScopeName] = () => scopeInstance
  }

  /**
   * Returns the registered scope helper for one scope name.
   * @param {string} scope
   * @returns {DeviseScope}
   */
  static getScope(scope) {
    const scopeCamelized = inflection.camelize(scope)
    const getScopeName = `get${scopeCamelized}Scope`

    return ApiMakerDevise[getScopeName]()
  }

  /** @returns {string[]} */
  static registeredScopes() {
    return Object.keys(shared.scopes)
  }

  /**
   * Signs in one scope over HTTP and refreshes websocket auth state.
   * @param {string} username
   * @param {string} password
   * @param {DeviseScopeArgs} args
   * @returns {Promise<{model: import("./base-model.js").default | undefined, response: DeviseSignInResponse}>}
   */
  static async signIn(username, password, args = {}) {
    if (!args.scope) args.scope = "user"

    const postData = {username, password, args}

    // Sign in over HTTP first so Devise can write the real session cookie and
    // remember-me token in the HTTP response.
    const response = /** @type {DeviseSignInResponse} */ (
      await Services.current().sendRequest("Devise::SignIn", postData, {forceHttp: true})
    )

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
   * @param {DeviseScopeArgs} [args]
   * @returns {Promise<DeviseSessionStatusResult>}
   */
  static async persistSession(args = {}) {
    if (!args.scope) args.scope = "user"

    const response = /** @type {DeviseSessionStatusResult} */ (
      await Services.current().sendRequest("Devise::PersistSession", args, {forceHttp: true})
    )

    const sessionStatusUpdater = SessionStatusUpdater.current()

    if (response.session_status) {
      sessionStatusUpdater.applyResult(response.session_status)
    } else {
      await sessionStatusUpdater.updateSessionStatus()
    }

    return response
  }

  /**
   * Updates the locally cached current model for one scope.
   * @param {DeviseCurrentScope} model
   * @param {DeviseScopeArgs} args
   */
  static updateSession(model, args = {}) {
    if (!args.scope) args.scope = "user"

    const camelizedScopeName = inflection.camelize(args.scope, true)

    ApiMakerDevise.current().currents[camelizedScopeName] = model
  }

  /**
   * Returns whether the current scope cache has been initialized locally.
   * @param {string} scope
   * @returns {boolean}
   */
  hasCurrentScope(scope) {
    const camelizedScopeName = inflection.camelize(scope, true)

    return camelizedScopeName in ApiMakerDevise.current().currents
  }

  /**
   * Marks one scope as signed out in the local current-model cache.
   * @param {DeviseScopeArgs} args
   */
  static setSignedOut(args) {
    ApiMakerDevise.current().currents[inflection.camelize(args.scope, true)] = null
  }

  /**
   * Signs out one scope over HTTP and refreshes websocket auth state.
   * @param {DeviseScopeArgs} args
   * @returns {Promise<DeviseSessionStatusResult>}
   */
  static async signOut(args = {}) {
    if (!args.scope) {
      args.scope = "user"
    }

    const response = /** @type {DeviseSessionStatusResult} */ (
      await Services.current().sendRequest("Devise::SignOut", {args}, {forceHttp: true})
    )
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
   * @param {SyncSessionArgs} args
   * @returns {Promise<DeviseSessionStatusResult>}
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
   * Updates local session status from one HTTP response payload.
   * @param {DeviseSessionStatusResult} httpResponse
   * @returns {Promise<DeviseSessionStatusResult>}
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
   * @param {DeviseScopeArgs & {shadowSessionToken?: string}} args
   * @returns {Promise<DeviseSessionStatusResult>}
   */
  static async refreshWebsocketSession(args) {
    return /** @type {DeviseSessionStatusResult} */ (await Services.current().sendRequest("Devise::PersistSession", args))
  }

  /**
   * Refreshes auth on the existing subscriptions channel pools.
   *
   * @param {DeviseScopeArgs & {shadowSessionToken?: string}} args
   * @returns {Promise<void>}
   */
  static async refreshSubscriptionAuthentication(args) {
    await CableConnectionPool.current().refreshAuthentication(args)
  }

  /** Constructor. */
  constructor() {
    this.currents = /** @type {Record<string, DeviseCurrentScope>} */ ({})
  }

  /**
   * Returns the current model cached for one scope.
   * @param {string} scope
   * @returns {DeviseCurrentScope}
   */
  getCurrentScope(scope) {
    if (!(scope in this.currents)) {
      this.currents[scope] = this.loadCurrentScope(scope)
    }

    return this.currents[scope]
  }

  /**
   * Returns whether the server rendered current-scope payload for one scope.
   * @param {string} scope
   * @returns {boolean}
   */
  hasGlobalCurrentScope(scope) {
    if (globalThis.apiMakerDeviseCurrent && scope in globalThis.apiMakerDeviseCurrent) {
      return true
    }

    return false
  }

  /**
   * Hydrates the current scope model from the server rendered payload.
   * @param {string} scope
   * @returns {DeviseCurrentScope}
   */
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
