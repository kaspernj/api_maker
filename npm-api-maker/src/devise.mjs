import CanCan from "./can-can.mjs"
import Deserializer from "./deserializer.mjs"
import {digg} from "diggerize"
import events from "./events.mjs"
import * as inflection from "inflection"
import modelClassRequire from "./model-class-require.mjs"
import Services from "./services.mjs"

const shared = {}

export default class ApiMakerDevise {
  static callSignOutEvent(args) {
    events.emit("onDeviseSignOut", {args})
  }

  static current() {
    if (!shared.currentApiMakerDevise) {
      shared.currentApiMakerDevise = new ApiMakerDevise()
    }

    return shared.currentApiMakerDevise
  }

  static events() {
    return events
  }

  static addUserScope(scope) {
    const currentMethodName = `current${inflection.camelize(scope)}`

    ApiMakerDevise[currentMethodName] = () => ApiMakerDevise.current().getCurrentScope(scope)

    const isSignedInMethodName = `is${inflection.camelize(scope)}SignedIn`

    ApiMakerDevise[isSignedInMethodName] = () => Boolean(ApiMakerDevise.current().getCurrentScope(scope))
  }

  static async signIn(username, password, args = {}) {
    if (!args.scope) args.scope = "user"

    const postData = {username, password, args}
    const response = await Services.current().sendRequest("Devise::SignIn", postData)

    let model = response.model

    if (Array.isArray(model)) model = model[0]

    await CanCan.current().resetAbilities()

    ApiMakerDevise.updateSession(model)
    events.emit("onDeviseSignIn", Object.assign({username}, args))

    return {model, response}
  }

  static updateSession(model, args = {}) {
    if (!args.scope) args.scope = "user"

    const camelizedScopeName = inflection.camelize(args.scope, true)

    ApiMakerDevise.current().currents[camelizedScopeName] = model
  }

  hasCurrentScope(scope) {
    const camelizedScopeName = inflection.camelize(scope, true)

    return camelizedScopeName in ApiMakerDevise.current().currents
  }

  static setSignedOut(args) {
    ApiMakerDevise.current().currents[inflection.camelize(args.scope, true)] = null
  }

  static async signOut(args = {}) {
    if (!args.scope) {
      args.scope = "user"
    }

    const response = await Services.current().sendRequest("Devise::SignOut", {args})

    await CanCan.current().resetAbilities()

    // Cannot use the class because they would both import each other
    if (shared.apiMakerSessionStatusUpdater) {
      shared.apiMakerSessionStatusUpdater.updateSessionStatus()
    }

    ApiMakerDevise.setSignedOut(args)
    ApiMakerDevise.callSignOutEvent(args)

    return response
  }

  constructor() {
    this.currents = {}
  }

  getCurrentScope(scope) {
    if (!(scope in this.currents)) {
      this.currents[scope] = this.loadCurrentScope(scope)
    }

    return this.currents[scope]
  }

  hasGlobalCurrentScope(scope) {
    if (globalThis.apiMakerDeviseCurrent && scope in globalThis.apiMakerDeviseCurrent) {
      return true
    }

    return false
  }

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
