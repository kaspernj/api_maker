import BaseModel from "./BaseModel"
import ModelsResponseReader from "./ModelsResponseReader"
import qs from "qs"
import Result from "./Result"

export default class Collection {
  constructor(args) {
    this.args = args
    this.includes = args.includes
    this.params = args.params
    this.ransackOptions = args.ransack || {}
  }

  each(callback) {
    this.toArray().then((array) => {
      for(let model in array) {
        callback.call(model)
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

  limit(amount) {
    this.limit = amount
    return this
  }

  loaded() {
    if (!(this.args.reflectionName in this.args.model.relationshipsCache)) {
      let model = this.args.model
      throw new Error(`${this.args.reflectionName} hasnt been loaded yet`)
    }

    return this.args.model.relationshipsCache[this.args.reflectionName]
  }

  preload(args) {
    this.includes = args
    return this
  }

  page(pageNumber) {
    if (!pageNumber)
      pageNumber = 1

    this.page = pageNumber

    if (!this.ransackOptions.s)
      this.ransackOptions.s = `${this.args.modelClass.modelClassData().primaryKey} asc`

    return this
  }

  pageKey(pageKeyValue) {
    this.pageKeyValue = pageKeyValue
    return this
  }

  ransack(params) {
    this.ransackOptions = Object.assign(this.ransackOptions, params)
    return this
  }

  result() {
    return new Promise((resolve, reject) => {
      this._response().then((response) => {
        let models = this._responseToModels(response)
        let result = new Result({
          "collection": this,
          "models": models,
          "response": response
        })
        resolve(result)
      })
    })
  }

  searchKey(searchKey) {
    this.searchKeyValue = searchKey
    return this
  }

  sort(sortBy) {
    this.ransackOptions["s"] = sortBy
    return this
  }

  toArray() {
    return new Promise((resolve, reject) => {
      this._response().then((response) => {
        let models = this._responseToModels(response)
        resolve(models)
      })
    })
  }

  modelClass() {
    return require(`ApiMaker/Models/${this.args.modelClass.modelClassData().name}`).default
  }

  _response() {
    return new Promise((resolve, reject) => {
      let dataToUse = qs.stringify(this._params(), {"arrayFormat": "brackets"})
      let urlToUse = `${this.args.modelClass.modelClassData().path}?${dataToUse}`

      let xhr = new XMLHttpRequest()
      xhr.open("GET", urlToUse)
      xhr.setRequestHeader("X-CSRF-Token", BaseModel._token())
      xhr.onload = () => {
        if (xhr.status == 200) {
          let response = JSON.parse(xhr.responseText)
          resolve(response)
        } else {
          reject({"responseText": xhr.responseText})
        }
      }
      xhr.send()
    })
  }

  _responseToModels(response) {
    let modelsResponseReader = new ModelsResponseReader({response: response})
    return modelsResponseReader.models()
  }

  _params() {
    let params = {}

    if (this.params)
      params = Object.assign(params, this.params)

    if (this.ransackOptions)
      params["q"] = this.ransackOptions

    if (this.limit)
      params["limit"] = this.limit

    if (this.includes)
      params["include"] = this.includes

    if (this.page)
      params["page"] = this.page

    return params
  }
}
