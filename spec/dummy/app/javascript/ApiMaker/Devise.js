export default class Collection {
  
    static currentUser() {
      return new Promise((resolve, reject) => {
        var apiMakerDataElement = document.querySelector(".api-maker-data")
        var keyName = "currentUserId"
        var scopeId = apiMakerDataElement.dataset[keyName]

        var modelClass = require("ApiMaker/User").default
        modelClass.find(scopeId).then((scopeInstance) => {
          resolve(scopeInstance)
        })
      })
    }
  
}
