import {digg} from "@kaspernj/object-digger"
import CommandsPool from "./commands-pool"
import merge from "merge"
import ModelsResponseReader from "./models-response-reader"
import { Result } from "@kaspernj/api-maker"

const inflection = require("inflection")

export default class Collection {
  constructor(args, queryArgs = {}) {
    this.queryArgs = queryArgs
    this.args = args
  }

  abilities(originalAbilities) {
    const newAbilities = {}

    for(const originalAbilityName in originalAbilities) {
      const newModelName = inflection.dasherize(inflection.underscore(originalAbilityName))
      const newValues = []
      const originalValues = originalAbilities[originalAbilityName]

      for(const originalAbilityName of originalValues) {
        const newAbilityName = inflection.underscore(originalAbilityName)
        newValues.push(newAbilityName)
      }

      newAbilities[newModelName] = newValues
    }

    return this._clone({abilities: newAbilities})
  }

  accessibleBy(abilityName) {
    return this._clone({accessibleBy: abilityName})
  }

  async count() {
    const response = await this._clone({count: true})._response()
    return response.count
  }

  distinct() {
    return this._clone({distinct: true})
  }

  async each(callback) {
    const array = await this.toArray()

    for(const model in array) {
      callback.call(model)
    }
  }

  async first() {
    const models = await this.toArray()
    return models[0]
  }

  groupBy(columnName) {
    return this._clone({
      groupBy: inflection.underscore(columnName)
    })
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
      throw new Error(`${this.args.reflectionName} hasnt been loaded yet`)
    }

    return this.args.model.relationshipsCache[this.args.reflectionName]
  }

  preload(preloadValue) {
    return this._clone({preload: preloadValue})
  }

  page(page) {
    if (!page)
      page = 1

    return this._clone({page})
  }

  pageKey(pageKey) {
    return this._clone({pageKey})
  }

  params() {
    let params = {}

    if (this.queryArgs.params) params = this._merge(params, this.queryArgs.params)
    if (this.queryArgs.abilities) params.abilities = this.queryArgs.abilities
    if (this.queryArgs.accessibleBy) params.accessible_by = inflection.underscore(this.queryArgs.accessibleBy)
    if (this.queryArgs.count) params.count = this.queryArgs.count
    if (this.queryArgs.distinct) params.distinct = this.queryArgs.distinct
    if (this.queryArgs.groupBy) params.group_by = this.queryArgs.groupBy
    if (this.queryArgs.ransack) params.q = this.queryArgs.ransack
    if (this.queryArgs.limit) params.limit = this.queryArgs.limit
    if (this.queryArgs.preload) params.preload = this.queryArgs.preload
    if (this.queryArgs.page) params.page = this.queryArgs.page
    if (this.queryArgs.per) params.per = this.queryArgs.per
    if (this.queryArgs.select) params.select = this.queryArgs.select
    if (this.queryArgs.selectColumns) params.select_columns = this.queryArgs.selectColumns

    return params
  }

  per(per) {
    return this._clone({per})
  }

  perKey(perKey) {
    return this._clone({perKey})
  }

  ransack(params) {
    return this._clone({ransack: params})
  }

  async result() {
    const response = await this._response()
    const models = this._responseToModels(response)
    const result = new Result({collection: this, models, response})
    return result
  }

  searchKey(searchKey) {
    return this._clone({searchKey: searchKey})
  }

  select(originalSelect) {
    const newSelect = {}

    for(const originalModelName in originalSelect) {
      const newModelName = inflection.dasherize(inflection.underscore(originalModelName))
      const newValues = []
      const originalValues = originalSelect[originalModelName]

      for(const originalAttributeName of originalValues) {
        const newAttributeName = inflection.underscore(originalAttributeName)
        newValues.push(newAttributeName)
      }

      newSelect[newModelName] = newValues
    }

    return this._clone({select: newSelect})
  }

  selectColumns(originalSelect) {
    const newSelect = {}

    for(const originalModelName in originalSelect) {
      const newModelName = inflection.dasherize(inflection.underscore(originalModelName))
      const newValues = []
      const originalValues = originalSelect[originalModelName]

      for(const originalAttributeName of originalValues) {
        const newAttributeName = inflection.underscore(originalAttributeName)
        newValues.push(newAttributeName)
      }

      newSelect[newModelName] = newValues
    }

    return this._clone({selectColumns: newSelect})
  }

  sort(sortBy) {
    return this._clone({ransack: {s: sortBy}})
  }

  async toArray() {
    const response = await this._response()
    return this._responseToModels(response)
  }

  modelClass() {
    const modelName = digg(this.args.modelClass.modelClassData(), "name")

    return digg(require("api-maker/models"), modelName)
  }

  _clone(args) {
    return new Collection(this.args, this._merge(this.queryArgs, args))
  }

  _merge(object1, object2) {
    return merge.recursive(true, object1, object2)
  }

  _response() {
    const modelClassData = this.args.modelClass.modelClassData()

    return CommandsPool.addCommand(
      {
        args: this.params(),
        command: `${modelClassData.collectionName}-index`,
        collectionName: modelClassData.collectionName,
        type: "index"
      },
      {}
    )
  }

  _responseToModels(response) {
    const modelsResponseReader = new ModelsResponseReader({
      collection: this,
      response
    })
    return modelsResponseReader.models()
  }
}
