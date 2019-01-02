import BaseModel from "./BaseModel"
import inflection from "inflection"
import ModelsResponseReader from "./ModelsResponseReader"
import objectAssignDeep from "object-assign-deep"
import qs from "qs"
import Result from "./Result"

export default class Collection {
  constructor(args) {
    this.args = args
  }

  accessibleBy(abilityName) {
    return this._clone({accessibleBy: abilityName})
  }

  accessibleBy(abilityName) {
    this.accessibleByValue = abilityName
    return this
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
    return this._clone({limit: amount})
  }

  loaded() {
    if (!(this.args.reflectionName in this.args.model.relationshipsCache)) {
      let model = this.args.model
      throw new Error(`${this.args.reflectionName} hasnt been loaded yet`)
    }

    return this.args.model.relationshipsCache[this.args.reflectionName]
  }

  preload(preloadValue) {
    return this._clone({preload: preloadValue})
  }

  page(pageNumber) {
    if (!pageNumber)
      pageNumber = 1

    let changes = {page: pageNumber}

    if (!this.args.ransack || !this.args.ransack.s)
      changes.ransack = {s: `${this.args.modelClass.modelClassData().primaryKey} asc`}

    return this._clone(changes)
  }

  pageKey(pageKeyValue) {
    return this._clone({pageKey: pageKeyValue})
  }

  ransack(params) {
    return this._clone({ransack: params})
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
    return this._clone({searchKey: searchKey})
  }

  sort(sortBy) {
    return this._clone({ransack: {s: sortBy}})
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

  _clone(args) {
    return new Collection(objectAssignDeep({}, args, this.args))
  }

  _response() {
    return new Promise((resolve, reject) => {
      let dataToUse = qs.stringify(this._params(), {arrayFormat: "brackets"})
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

    if (this.args.params)
      objectAssignDeep(params, this.args.params)

    if (this.args.accessibleBy) {
      params.accessible_by = inflection.underscore(this.args.accessibleBy)
    }

    if (this.args.ransack)
      params.q = this.args.ransack

    if (this.args.limit)
      params.limit = this.args.limit

    if (this.args.preload)
      params.include = this.args.preload

    if (this.args.page)
      params.page = this.args.page

    return params
  }
}
