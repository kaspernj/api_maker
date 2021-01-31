import CanCan from "./can-can"
import {digg} from "@kaspernj/object-digger"
import EventEmitter from "events"
import inflection from "inflection"
import Services from "./services"

export default class ApiMakerDevise {
  static callSignOutEvent(args) {
    ApiMakerDevise.events().emit("onDeviseSignOut", {args})
  }

  static current() {
    if (!window.currentApiMakerDevise)
      window.currentApiMakerDevise = new ApiMakerDevise()

    return window.currentApiMakerDevise
  }

  static events() {
    if (!window.apiMakerDeviseEvents)
      window.apiMakerDeviseEvents = new EventEmitter()

    return window.apiMakerDeviseEvents
  }

  static addUserScope(scope) {
    const currentMethodName = `current${inflection.camelize(scope)}`

    ApiMakerDevise[currentMethodName] = function() {
      return ApiMakerDevise.current().getCurrentScope(scope)
    }

    const isSignedInMethodName = `is${inflection.camelize(scope)}SignedIn`

    ApiMakerDevise[isSignedInMethodName] = function() {
      if (ApiMakerDevise.current().getCurrentScope(scope)) {
        return true
      }

      return false
    }
  }

  static async signIn(username, password, args = {}) {
    if (!args.scope)
      args.scope = "user"

    const postData = {username, password, args}
    const response = await Services.current().sendRequest("Devise::SignIn", postData)
    const modelClass = digg(require("api-maker/models"), inflection.camelize(args.scope))
    const modelInstance = new modelClass(response.model_data)

    CanCan.current().resetAbilities()

    ApiMakerDevise.updateSession(modelInstance)
    ApiMakerDevise.events().emit("onDeviseSignIn", Object.assign({username}, args))

    return {model: modelInstance, response}
  }

  static updateSession(model) {
    const scope = digg(model.modelClassData(), "name")
    ApiMakerDevise.current().currents[scope] = model
  }

  static setSignedOut(args) {
    ApiMakerDevise.current().currents[inflection.camelize(args.scope)] = null
  }

  static async signOut(args = {}) {
    if (!args.scope)
      args.scope = "User"

    const response = await Services.current().sendRequest("Devise::SignOut", {args})

    CanCan.current().resetAbilities()
    ApiMakerDevise.setSignedOut(args)
    ApiMakerDevise.callSignOutEvent(args)

    return response
  }

  constructor() {
    this.currents = {}
  }

  getCurrentScope(scope) {
    if (!(scope in this.currents))
      this.currents[scope] = this.loadCurrentScope(scope)

    return this.currents[scope]
  }

  loadCurrentScope(scope) {
    const apiMakerDataElement = document.querySelector(".api-maker-data")
    const keyName = `current${inflection.camelize(scope)}`
    const scopeData = apiMakerDataElement.dataset[keyName]

    if (!scopeData)
      return null

    const modelClass = digg(require("api-maker/models"), inflection.camelize(scope))
    const modelInstance = new modelClass({data: JSON.parse(scopeData)})

    return modelInstance
  }
}
