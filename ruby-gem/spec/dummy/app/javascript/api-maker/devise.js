import {Api, CanCan, CustomError} from "@kaspernj/api-maker"
import {digg} from "@kaspernj/object-digger"
import EventEmitter from "events"
const inflection = require("inflection")

export default class Devise {
  static callSignOutEvent(args) {
    Devise.events().emit("onDeviseSignOut", {args: args})
  }

  static current() {
    if (!window.currentApiMakerDevise)
      window.currentApiMakerDevise = new Devise()

    return window.currentApiMakerDevise
  }

  static events() {
    if (!window.apiMakerDeviseEvents)
      window.apiMakerDeviseEvents = new EventEmitter()

    return window.apiMakerDeviseEvents
  }

  
    
    
      static isUserSignedIn() {
        if (Devise.current().getCurrentScope("User"))
          return true

        return false
      }

      static currentUser() {
        return Devise.current().getCurrentScope("User")
      }
    
  

  static async signIn(username, password, args = {}) {
    if (!args.scope)
      args.scope = "user"

    const postData = {"username": username, "password": password, "args": args}
    const response = await Api.post("/api_maker/devise/do_sign_in", postData)

    if (response.success) {
      const modelClass = digg(require("api-maker/models"), inflection.camelize(args.scope))
      const modelInstance = new modelClass(response.model_data)

      CanCan.current().resetAbilities()

      Devise.updateSession(modelInstance)
      Devise.events().emit("onDeviseSignIn", Object.assign({username: username}, args))

      return {model: modelInstance, response: response}
    } else {
      throw new CustomError("Sign in failed", {response: response})
    }
  }

  static updateSession(model) {
    const scope = model.modelClassData().name
    Devise.current().currents[scope] = model
  }

  static setSignedOut(args) {
    Devise.current().currents[inflection.camelize(args.scope)] = null
  }

  static async signOut(args = {}) {
    if (!args.scope)
      args.scope = "user"

    const postData = {"args": args}
    const response = await Api.post("/api_maker/devise/do_sign_out", postData)

    if (response.success) {
      CanCan.current().resetAbilities()
      Devise.setSignedOut(args)
      Devise.callSignOutEvent(args)
      return response
    } else {
      throw new CustomError("Sign out failed", {response: response})
    }
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
