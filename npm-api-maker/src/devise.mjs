import CanCan from "./can-can.mjs"
import Deserializer from "./deserializer.mjs"
import {digg} from "diggerize"
import EventEmitter from "events"
import * as inflection from "inflection"
import modelClassRequire from "./model-class-require.mjs"
import Services from "./services.mjs"

export default class ApiMakerDevise {
  static callSignOutEvent (args) {
    ApiMakerDevise.events().emit("onDeviseSignOut", {args})
  }

  static current () {
    if (!globalThis.currentApiMakerDevise)
    globalThis.currentApiMakerDevise = new ApiMakerDevise()

    return globalThis.currentApiMakerDevise
  }

  static events () {
    if (!globalThis.apiMakerDeviseEvents) {
      globalThis.apiMakerDeviseEvents = new EventEmitter()
      globalThis.apiMakerDeviseEvents.setMaxListeners(1000)
    }

    return globalThis.apiMakerDeviseEvents
  }

  static addUserScope (scope) {
    const currentMethodName = `current${inflection.camelize(scope)}`

    ApiMakerDevise[currentMethodName] = function () {
      return ApiMakerDevise.current().getCurrentScope(scope)
    }

    const isSignedInMethodName = `is${inflection.camelize(scope)}SignedIn`

    ApiMakerDevise[isSignedInMethodName] = function () {
      if (ApiMakerDevise.current().getCurrentScope(scope)) {
        return true
      }

      return false
    }
  }

  static async signIn (username, password, args = {}) {
    if (!args.scope) args.scope = "user"

    const postData = {username, password, args}
    const response = await Services.current().sendRequest("Devise::SignIn", postData)

    let model = response.model

    if (Array.isArray(model)) model = model[0]

    await CanCan.current().resetAbilities()

    ApiMakerDevise.updateSession(model)
    ApiMakerDevise.events().emit("onDeviseSignIn", Object.assign({username}, args))

    return {model, response}
  }

  static updateSession (model) {
    const scope = digg(model.modelClassData(), "name")
    const camelizedScopeName = inflection.camelize(scope, true)

    ApiMakerDevise.current().currents[camelizedScopeName] = model
  }

  static setSignedOut (args) {
    ApiMakerDevise.current().currents[inflection.camelize(args.scope, true)] = null
  }

  static async signOut (args = {}) {
    if (!args.scope)
      args.scope = "user"

    const response = await Services.current().sendRequest("Devise::SignOut", {args})

    await CanCan.current().resetAbilities()

    // Cannot use the class because they would both import each other
    if (globalThis.apiMakerSessionStatusUpdater) {
      globalThis.apiMakerSessionStatusUpdater.updateSessionStatus()
    }

    ApiMakerDevise.setSignedOut(args)
    ApiMakerDevise.callSignOutEvent(args)

    return response
  }

  constructor () {
    this.currents = {}
  }

  getCurrentScope (scope) {
    if (!(scope in this.currents))
      this.currents[scope] = this.loadCurrentScope(scope)

    return this.currents[scope]
  }

  loadCurrentScope (scope) {
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
