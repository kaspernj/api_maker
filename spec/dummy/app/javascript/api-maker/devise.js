import Api from "./api"
import CustomError from "./custom-error"
import EventEmitter from "events"
const inflection = require("inflection")

export default class Devise {
  static callSignOutEvent(args) {
    Devise.events().emit("onDeviseSignOut", {args: args})
  }

  static events() {
    if (!window.apiMakerDeviseEvents)
      window.apiMakerDeviseEvents = new EventEmitter()

    return window.apiMakerDeviseEvents
  }

  
    
    
      static isUserSignedIn() {
        let apiMakerDataElement = document.querySelector(".api-maker-data")
        let keyName = "currentUser"
        let scopeData = apiMakerDataElement.dataset[keyName]

        if (scopeData)
          return true

        return false
      }

      static currentUser() {
        let apiMakerDataElement = document.querySelector(".api-maker-data")
        let keyName = "currentUser"
        let scopeData = apiMakerDataElement.dataset[keyName]

        if (!scopeData)
          return null

        let modelClass = require("api-maker/models/user").default
        let modelInstance = new modelClass({data: JSON.parse(scopeData)})
        return modelInstance
      }
    
  

  static signIn(username, password, args = {}) {
    if (!args.scope)
      args.scope = "user"

    return new Promise((resolve, reject) => {
      var postData = {"username": username, "password": password, "args": args}
      Api.post("/api_maker/devise/do_sign_in", postData)
        .then((response) => {
          var modelClass = require(`api-maker/models/${inflection.dasherize(args.scope)}`).default
          var modelInstance = new modelClass(response.model_data)

          Devise.updateSession(modelInstance)
          resolve({response: response})
          Devise.events().emit("onDeviseSignIn", Object.assign({username: username}, args))
        }, (response) => {
          reject(new CustomError("Sign in failed", {response: response}))
        })
    })
  }

  static updateSession(model) {
    let apiMakerDataElement = document.querySelector(".api-maker-data")
    let keyName = `current${model.modelClassData().name}`
    apiMakerDataElement.dataset[keyName] = JSON.stringify({type: model.modelClassData().pluralName, id: model.id(), attributes: model.modelData})
  }

  static setSignedOut(args) {
    var apiMakerDataElement = document.querySelector(".api-maker-data")
    var keyName = `current${inflection.camelize(args.scope)}`

    delete apiMakerDataElement.dataset[keyName]
  }

  static signOut(args = {}) {
    if (!args.scope)
      args.scope = "user"

    return new Promise((resolve, reject) => {
      let postData = {"args": args}
      Api.post("/api_maker/devise/do_sign_out", postData)
        .then((response) => {
          Devise.setSignedOut(args)
          resolve(response)
          Devise.callSignOutEvent(args)
        }, (response) => {
          reject(new CustomError("Sign out failed", {response: response}))
        })
    })
  }
}
