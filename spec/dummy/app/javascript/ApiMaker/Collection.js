import BaseModel from "./BaseModel"
import qs from "qs"

export default class Collection {
  constructor(args) {
    this.args = args
    this.includes = args.includes
    this.ransack = args.ransack
  }

  each(callback) {
    this.toArray().then((array) => {
      for(var model in array) {
        callback.apply(model)
      }
    })
  }

  preload(args) {
    this.includes = args
    return this
  }

  page(pageNumber) {
    this.page = pageNumber
    return this
  }

  ransack(params) {
    this.ransack = Object.assign(this.ransack, params)
    return this
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
      var dataToUse = qs.stringify(this._params())
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

  _params() {
    var params = {}
    if (this.ransack)
      params["q"] = this.ransack

    if (this.page)
      params["page"] = this.page

    if (this.includes)
      params["include"] = this.includes

    return params
  }
}
