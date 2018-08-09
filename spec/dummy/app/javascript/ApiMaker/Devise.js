export default class Collection {
  
    
    
      static isUserSignedIn() {
        var apiMakerDataElement = document.querySelector(".api-maker-data")
        var keyName = "currentUserId"
        var scopeId = apiMakerDataElement.dataset[keyName]

        if (scopeId) {
          return true
        }

        return false
      }

      static currentUser() {
        return new Promise((resolve, reject) => {
          var apiMakerDataElement = document.querySelector(".api-maker-data")
          var keyName = "currentUserId"
          var scopeId = apiMakerDataElement.dataset[keyName]

          var modelClass = require("ApiMaker/Models/User").default
          modelClass.find(scopeId).then((scopeInstance) => {
            resolve(scopeInstance)
          })
        })
      }
    
  
}
