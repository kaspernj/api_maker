import Api from "./api"
const inflection = require("inflection")

export default class Devise {
  
    
    
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
      let postData = {"username": username, "password": password, "args": args}
      Api.post("/api_maker/devise/do_sign_in", postData)
        .then((response) => {
          let modelClass = require(`api-maker/models/${inflection.dasherize(args.scope)}`).default
          let modelInstance = new modelClass(response.model_data)
          Devise.updateSession(modelInstance)

          resolve({"response": response})
          let event = document.createEvent("Event")
          event.initEvent("devise-signed", false, true)
          window.dispatchEvent(event, {"args": args})
        }, (response) => {
          reject(response)
        })
    })
  }

  static updateSession(model) {
    let apiMakerDataElement = document.querySelector(".api-maker-data")
    let keyName = `current${model.modelClassData().name}`
    apiMakerDataElement.dataset[keyName] = JSON.stringify({type: model.modelClassData().pluralName, id: model.id(), attributes: model.modelData})
  }

  static signOut(args = {}) {
    if (!args.scope)
      args.scope = "user"

    return new Promise((resolve, reject) => {
      let postData = {"args": args}
      Api.post("/api_maker/devise/do_sign_out", postData)
        .then((response) => {
          let apiMakerDataElement = document.querySelector(".api-maker-data")
          let keyName = `current${inflection.camelize(args.scope, true)}`
          delete apiMakerDataElement.dataset[keyName]

          resolve(response)
          let event = document.createEvent("Event")
          event.initEvent("devise-signed", false, true)
          window.dispatchEvent(event, {"args": args})
        }, (response) => {
          reject(response)
        })
    })
  }
}
