import BaseModel from "./base-model"
import CommandsPool from "./commands-pool"
const inflection = require("inflection")
import merge from "merge"
import ModelsResponseReader from "./models-response-reader"
import qs from "qs"
import Result from "./result"

export default class Collection {
  constructor(args, queryArgs = {}) {
    this.queryArgs = queryArgs
    this.args = args
  }

  accessibleBy(abilityName) {
    return this._clone({accessibleBy: abilityName})
  }

  async each(callback) {
    var array = await this.toArray()

    for(var model in array) {
      callback.call(model)
    }
  }

  async first() {
    var models = await this.toArray()
    return models[0]
  }

  isLoaded() {
    if (this.args.reflectionName in this.args.model.relationshipsCache)
      return true

    return false
  }

  limit(amount) {
    return this._clone({limit: amount})
  }

  loaded() {
    if (!(this.args.reflectionName in this.args.model.relationshipsCache)) {
      var model = this.args.model
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

    var changes = {page: pageNumber}

    if (!this.queryArgs.ransack || !this.queryArgs.ransack.s)
      changes.ransack = {s: `${this.args.modelClass.modelClassData().primaryKey} asc`}

    return this._clone(changes)
  }

  pageKey(pageKeyValue) {
    return this._clone({pageKey: pageKeyValue})
  }

  ransack(params) {
    return this._clone({ransack: params})
  }

  async result() {
    var response = await this._response()
    var models = this._responseToModels(response)
    var result = new Result({collection: this, models, response})
    return result
  }

  searchKey(searchKey) {
    return this._clone({searchKey: searchKey})
  }

  select(originalSelect) {
    var newSelect = {}

    for(var originalModelName in originalSelect) {
      var newModalName = inflection.dasherize(inflection.underscore(originalModelName))
      var newValues = []
      var originalValues = originalSelect[originalModelName]

      for(var originalAttributeName of originalValues) {
        var newAttributeName = inflection.underscore(originalAttributeName)
        newValues.push(newAttributeName)
      }

      newSelect[newModalName] = newValues
    }

    return this._clone({select: newSelect})
  }

  sort(sortBy) {
    return this._clone({ransack: {s: sortBy}})
  }

  async toArray() {
    var response = await this._response()
    return this._responseToModels(response)
  }

  modelClass() {
    return require(`api-maker/models/${inflection.dasherize(inflection.singularize(this.args.modelClass.modelClassData().collectionName))}`).default
  }

  _clone(args) {
    return new Collection(this.args, this._merge(this.queryArgs, args))
  }

  _merge(object1, object2) {
    return merge.recursive(true, object1, object2)
  }

  _response() {
    var modelClassData = this.args.modelClass.modelClassData()

    return CommandsPool.addCommand(
      {
        args: this._params(),
        command: `${modelClassData.collectionKey}-index`,
        collectionKey: modelClassData.collectionKey,
        type: "index"
      },
      {}
    )
  }

  _responseToModels(response) {
    var modelsResponseReader = new ModelsResponseReader({response: response})
    return modelsResponseReader.models()
  }

  _params() {
    var params = {}

    if (this.queryArgs.params)
      params = this._merge(params, this.queryArgs.params)

    if (this.queryArgs.accessibleBy) {
      params.accessible_by = inflection.underscore(this.queryArgs.accessibleBy)
    }

    if (this.queryArgs.ransack)
      params.q = this.queryArgs.ransack

    if (this.queryArgs.limit)
      params.limit = this.queryArgs.limit

    if (this.queryArgs.preload)
      params.include = this.queryArgs.preload

    if (this.queryArgs.page)
      params.page = this.queryArgs.page

    if (this.queryArgs.select)
      params.select = this.queryArgs.select

    return params
  }
}
