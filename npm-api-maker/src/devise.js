import * as inflection from "inflection" // eslint-disable-line sort-imports
import CableConnectionPool from "./cable-connection-pool.js"
import {createContext} from "react"
import Deserializer from "./deserializer.js" // eslint-disable-line sort-imports
import events from "./events.js"
import modelClassRequire from "./model-class-require.js"
import {resetChannelsConsumer} from "./channels-consumer.js"
import SessionStatusUpdater from "./session-status-updater.js" // eslint-disable-line sort-imports
import Services from "./services.js" // eslint-disable-line sort-imports
import WebsocketRequestClient from "./websocket-request-client.js"

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

    // Always use HTTP for sign-in so Devise sets the session cookie and
    // remember-me token directly in the HTTP response. WebSocket sign-in
    // cannot set cookies (no HTTP response headers), so it relied on a
    // fragile Rails.cache-based shadow session handoff via persistSession.
    const response = await Services.current().sendRequest("Devise::SignIn", postData, {forceHttp: true})

    let model = response.model

    if (Array.isArray(model)) model = model[0]

    const sessionStatusUpdater = SessionStatusUpdater.current()

    if (response.session_status) {
      sessionStatusUpdater.applyResult(response.session_status)
    } else {
      await sessionStatusUpdater.updateSessionStatus()
    }

    // Reset the ActionCable connection so it reconnects with the new
    // session cookies. Without this, WebSocket commands would still run
    // as the previous (anonymous/old) user.
    resetChannelsConsumer()
    WebsocketRequestClient.resetCurrent()
    CableConnectionPool.resetCurrent()

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

    const sessionStatusUpdater = SessionStatusUpdater.current()

    if (response.session_status) {
      sessionStatusUpdater.applyResult(response.session_status)
    } else {
      await sessionStatusUpdater.updateSessionStatus()
      ApiMakerDevise.setSignedOut(args)
      ApiMakerDevise.callSignOutEvent(args)
    }

    // Reset the ActionCable connection so it reconnects without the
    // old user's session. Without this, WebSocket commands would still
    // run as the signed-out user.
    resetChannelsConsumer()
    WebsocketRequestClient.resetCurrent()
    CableConnectionPool.resetCurrent()

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
