import Api from "./Api"
import changeCase from "change-case"

export default class Devise {
  
    
    
      static isUserSignedIn() {
        var apiMakerDataElement = document.querySelector(".api-maker-data")
        var keyName = "currentUser"
        var scopeData = apiMakerDataElement.dataset[keyName]

        if (scopeData)
          return true

        return false
      }

      static currentUser() {
        var apiMakerDataElement = document.querySelector(".api-maker-data")
        var keyName = "currentUser"
        var scopeData = apiMakerDataElement.dataset[keyName]

        if (!scopeData)
          return reject("Not signed in")

        var modelClass = require("ApiMaker/Models/User").default
        var modelInstance = new modelClass(JSON.parse(scopeData))
        return modelInstance
      }
    
  

  static signIn(username, password, args = {}) {
    if (!args.scope)
      args.scope = "user"

    return new Promise((resolve, reject) => {
      var postData = {"username": username, "password": password, "args": args}
      Api.post("/api_maker/devise/do_sign_in", postData)
        .then((response) => {
          var apiMakerDataElement = document.querySelector(".api-maker-data")
          var keyName = `current${changeCase.pascalCase(args.scope)}`
          apiMakerDataElement.dataset[keyName] = JSON.stringify(response.model_data)

          resolve({"response": response})
          window.dispatchEvent(new Event("devise-signed", {"args": args}))
        }, (response) => {
          reject(response)
        })
    })
  }

  static signOut(args = {}) {
    if (!args.scope)
      args.scope = "user"

    return new Promise((resolve, reject) => {
      var postData = {"args": args}
      Api.post("/api_maker/devise/do_sign_out", postData)
        .then((response) => {
          var apiMakerDataElement = document.querySelector(".api-maker-data")
          var keyName = `current${changeCase.pascalCase(args.scope)}`
          delete apiMakerDataElement.dataset[keyName]

          resolve(response)
          window.dispatchEvent(new Event("devise-signed", {"args": args}))
        }, (response) => {
          reject(response)
        })
    })
  }
}
