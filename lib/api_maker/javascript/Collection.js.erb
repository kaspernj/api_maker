import BaseModel from "./BaseModel"
import qs from "qs"

export default class Collection {
  constructor(args) {
    this.args = args

    if (args.ransack) {
      this.ransack = args.ransack
    } else {
      this.ransack = {}
    }
  }

  each(callback) {
    this.toArray().then((array) => {
      for(var model in array) {
        callback.apply(model)
      }
    })
  }

  first() {
    return new Promise((resolve, reject) => {
      this.toArray().then((models) => {
        resolve(models[0])
      })
    })
  }

  toArray() {
    return new Promise((resolve, reject) => {
      var modelClass = require("ApiMaker/Models/" + this.args.modelName).default
      var dataToUse = qs.stringify({"q": this.ransack})
      var urlToUse = this.args.targetPathName + "?" + dataToUse

      var xhr = new XMLHttpRequest()
      xhr.open("GET", urlToUse)
      xhr.setRequestHeader("X-CSRF-Token", BaseModel._token())
      xhr.onload = () => {
        if (xhr.status == 200) {
          var response = JSON.parse(xhr.responseText)

          var array = []
          for(var modelDataKey in response.collection) {
            var modelData = response.collection[modelDataKey]
            var modelInstance = new modelClass(modelData)
            array.push(modelInstance)
          }

          resolve(array)
        } else {
          reject({"responseText": xhr.responseText})
        }
      }
      xhr.send()
    })
  }
}
