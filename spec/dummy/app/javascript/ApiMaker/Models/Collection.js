export default class Collection {
  constructor(args) {
    this.args = args

    if (args.ransack) {
      this.ransack = args.ransack
    } else {
      this.ransack = {}
    }
  }

  toArray() {
    return new Promise((resolve, reject) => {
      var modelClass = require("ApiMaker/Models/" + this.args.modelName).default
      var useToUse = "/api_maker/" + this.args.targetPathName
      var dataToUse = $.param({
        "q": this.ransack
      })

      Rails.ajax({type: "GET", url: useToUse, data: dataToUse, success: (response) => {
        var array = []
        for(var modelDataKey in response.collection) {
          var modelData = response.collection[modelDataKey]
          var modelInstance = new modelClass(modelData)
          array.push(modelInstance)
        }

        resolve(array)
      }})
    })
  }
}
