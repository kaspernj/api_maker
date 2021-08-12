const CanCan = require("./can-can.cjs")
const Deserializer = require("./deserializer.cjs")
const {digg} = require("@kaspernj/object-digger")
const EventEmitter = require("events")
const inflection = require("inflection")
const Services = require("./services.cjs")

module.exports = class ApiMakerDevise {
  static callSignOutEvent(args) {
    ApiMakerDevise.events().emit("onDeviseSignOut", {args})
  }

  static current() {
    if (!global.currentApiMakerDevise)
    global.currentApiMakerDevise = new ApiMakerDevise()

    return global.currentApiMakerDevise
  }

  static events() {
    if (!global.apiMakerDeviseEvents) {
      global.apiMakerDeviseEvents = new EventEmitter()
      global.apiMakerDeviseEvents.setMaxListeners(1000)
    }

    return global.apiMakerDeviseEvents
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
    const modelInstance = new modelClass(digg(response, "model_data"))

    await CanCan.current().resetAbilities()

    ApiMakerDevise.updateSession(modelInstance)
    ApiMakerDevise.events().emit("onDeviseSignIn", Object.assign({username}, args))

    return {model: modelInstance, response}
  }

  static updateSession(model) {
    const scope = digg(model.modelClassData(), "name")
    const camelizedScopeName = inflection.camelize(scope, true)

    ApiMakerDevise.current().currents[camelizedScopeName] = model
  }

  static setSignedOut(args) {
    ApiMakerDevise.current().currents[inflection.camelize(args.scope, true)] = null
  }

  static async signOut(args = {}) {
    if (!args.scope)
      args.scope = "user"

    const response = await Services.current().sendRequest("Devise::SignOut", {args})

    await CanCan.current().resetAbilities()

    // Cannot use the class because they would both import each other
    if (global.apiMakerSessionStatusUpdater) {
      global.apiMakerSessionStatusUpdater.updateSessionStatus()
    }

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
    const scopeData = global.apiMakerDeviseCurrent[scope]

    if (!scopeData)
      return null

    const parsedScopeData = Deserializer.parse(scopeData)
    const modelClass = digg(require("api-maker/models"), inflection.camelize(scope))
    const modelInstance = new modelClass({data: parsedScopeData})

    return modelInstance
  }
}
