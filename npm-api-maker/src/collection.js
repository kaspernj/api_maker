import cloneDeep from "clone-deep"
import CommandsPool from "./commands-pool"
import {digg} from "diggerize"
import * as inflection from "inflection"
import {incorporate} from "incorporator"
import modelClassRequire from "./model-class-require"
import Result from "./result"
import uniqunize from "uniqunize"

export default class ApiMakerCollection {
  static apiMakerType = "Collection"

  constructor(args, queryArgs = {}) {
    this.queryArgs = queryArgs
    this.args = args
  }

  abilities(originalAbilities) {
    const newAbilities = {}

    for (const originalAbilityName in originalAbilities) {
      const newModelName = inflection.underscore(originalAbilityName)
      const newValues = []
      const originalValues = originalAbilities[originalAbilityName]

      for (const originalAbilityName of originalValues) {
        const newAbilityName = inflection.underscore(originalAbilityName)
        newValues.push(newAbilityName)
      }

      newAbilities[newModelName] = newValues
    }

    return this._merge({abilities: newAbilities})
  }

  /**
   * @param {string} abilityName
   * @returns {this}
   */
  accessibleBy(abilityName) {
    return this._merge({accessibleBy: inflection.underscore(abilityName)})
  }

  /**
   * @returns {Promise<number>}
   */
  async count() {
    const response = await this.clone()._merge({count: true})._response()

    return digg(response, "count")
  }

  /**
   * @returns {this}
   */
  distinct() {
    return this._merge({distinct: true})
  }

  /**
   * @param {function(import("./base-model.js").default) : void} callback
   * @returns {void}
   */
  async each(callback) {
    const array = await this.toArray()

    for (const model in array) {
      callback.call(model)
    }
  }

  /**
   * @returns {this}
   */
  except(...keys) {
    for (const key of keys) {
      if (key == "page") {
        delete this.queryArgs[key]
      } else {
        throw new Error(`Unhandled key: ${key}`)
      }
    }

    return this
  }

  /**
   * @returns {Promise<import("./base-model.js").default>}
   */
  async first() {
    const models = await this.toArray()
    return models[0]
  }

  groupBy(...arrayOfTablesAndColumns) {
    const arrayOfTablesAndColumnsWithLowercaseColumns = arrayOfTablesAndColumns.map((tableAndColumn) => {
      if (Array.isArray(tableAndColumn)) {
        return [tableAndColumn[0], tableAndColumn[1].toLowerCase()]
      } else {
        return tableAndColumn.toLowerCase()
      }
    })
    const currentGroupBy = this.queryArgs.groupBy || []
    const newGroupBy = currentGroupBy.concat(arrayOfTablesAndColumnsWithLowercaseColumns)

    return this._merge({
      groupBy: newGroupBy
    })
  }

  async ensureLoaded() {
    if (!this.isLoaded()) {
      const models = await this.toArray()

      this.set(models)
    }

    return this.loaded()
  }

  /**
   * @returns {boolean}
   */
  isLoaded() {
    const {model, reflectionName} = this.args

    if (reflectionName in model.relationshipsCache) {
      return true
    } else if (reflectionName in model.relationships) {
      return true
    }

    return false
  }

  /**
   * @param {number} amount
   * @returns {this}
   */
  limit(amount) {
    return this._merge({limit: amount})
  }

  /**
   * @returns {Array<import("./base-model.js").default}
   */
  preloaded() {
    if (!(this.args.reflectionName in this.args.model.relationshipsCache)) {
      throw new Error(`${this.args.reflectionName} hasnt been loaded yet`)
    }

    return this.args.model.relationshipsCache[this.args.reflectionName]
  }

  /**
   * @returns {import("./base-model.js").default | Array<import("./base-model.js").default>}
   */
  loaded() {
    const {model, reflectionName} = this.args

    if (reflectionName in model.relationships) {
      return model.relationships[reflectionName]
    } else if (reflectionName in model.relationshipsCache) {
      return model.relationshipsCache[reflectionName]
    } else if (model.isNewRecord()) {
      const reflectionNameUnderscore = inflection.underscore(reflectionName)

      // Initialize as empty and try again to return the empty result
      this.set([])

      return digg(model.relationships, reflectionNameUnderscore)
    } else {
      const relationshipsLoaded = uniqunize(Object.keys(model.relationships).concat(Object.keys(model.relationshipsCache)))

      throw new Error(`${reflectionName} hasnt been loaded yet on ${model.modelClassData().name}. Loaded was: ${relationshipsLoaded.join(", ")}`)
    }
  }

  // Replaces the relationships with the given new collection.
  set(newCollection) {
    this.args.model.relationships[this.args.reflectionName] = newCollection
  }

  // Pushes another model onto the given collection.
  push(newModel) {
    const {model, reflectionName} = this.args

    if (!(reflectionName in model.relationships)) {
      model.relationships[reflectionName] = []
    }

    if (!model.relationships[reflectionName].includes(newModel)) {
      model.relationships[reflectionName].push(newModel)
    }
  }

  // Array shortcuts
  find = (...args) => this.loaded().find(...args)
  forEach = (...args) => this.loaded().forEach(...args)
  map = (...args) => this.loaded().map(...args)

  /**
   * @param {string[]} preloadValue
   * @returns {this}
   */
  preload(preloadValue) {
    return this._merge({preload: preloadValue})
  }

  /**
   * @param {number} page
   * @returns {this}
   */
  page(page) {
    if (!page) page = 1

    return this._merge({page})
  }

  /**
   * @param {string} pageKey
   * @returns {this}
   */
  pageKey(pageKey) {
    return this._merge({pageKey})
  }

  /**
   * @returns {boolean}
   */
  isFiltered() {
    const {queryArgs} = this

    if (
      queryArgs.accessibleBy ||
      queryArgs.count ||
      queryArgs.limit ||
      queryArgs.page ||
      queryArgs.params ||
      queryArgs.per ||
      queryArgs.ransack ||
      queryArgs.search
    ) {
      return true
    }

    return false
  }

  /**
   * @returns {Record<string, any>}
   */
  params() {
    let params = {}

    if (this.queryArgs.params) params = incorporate(params, this.queryArgs.params)
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
    if (this.queryArgs.search) params.search = this.queryArgs.search
    if (this.queryArgs.select) params.select = this.queryArgs.select
    if (this.queryArgs.selectColumns) params.select_columns = this.queryArgs.selectColumns

    return params
  }

  /**
   * @param {number} per
   * @returns {this}
   */
  per(per) {
    return this._merge({per})
  }

  /**
   * @param {string} perKey
   * @returns {this}
   */
  perKey(perKey) {
    return this._merge({perKey})
  }

  /**
   * @param {Record<string, any>} params
   * @returns {this}
   */
  ransack(params) {
    if (params) this._merge({ransack: params})
    return this
  }

  /**
   * @returns {Promise<Result>}
   */
  async result() {
    const response = await this._response()
    const models = digg(response, "collection")

    this._addQueryToModels(models)

    const result = new Result({collection: this, models, response})

    return result
  }

  /**
   * @param {Record<string, any>} params
   * @returns {this}
   */
  search(params) {
    if (params) this._merge({search: params})
    return this
  }

  /**
   * @param {string} searchKey
   * @returns {this}
   */
  searchKey(searchKey) {
    return this._merge({searchKey})
  }

  /**
   * @param {Record<string, string[]>} originalSelect
   * @returns {this}
   */
  select(originalSelect) {
    const newSelect = {}

    for (const originalModelName in originalSelect) {
      const newModelName = inflection.underscore(originalModelName)
      const newValues = []
      const originalValues = originalSelect[originalModelName]

      for (const originalAttributeName of originalValues) {
        const newAttributeName = inflection.underscore(originalAttributeName)
        newValues.push(newAttributeName)
      }

      newSelect[newModelName] = newValues
    }

    return this._merge({select: newSelect})
  }

  /**
   * @param {Record<string, string[]>} originalSelect
   * @returns {this}
   */
  selectColumns(originalSelect) {
    const newSelect = {}

    for (const originalModelName in originalSelect) {
      const newModelName = inflection.underscore(inflection.underscore(originalModelName))
      const newValues = []
      const originalValues = originalSelect[originalModelName]

      for (const originalAttributeName of originalValues) {
        const newAttributeName = inflection.underscore(originalAttributeName)
        newValues.push(newAttributeName)
      }

      newSelect[newModelName] = newValues
    }

    return this._merge({selectColumns: newSelect})
  }

  /**
   * @param {string} sortBy
   * @returns {this}
   */
  sort(sortBy) {
    return this._merge({ransack: {s: sortBy}})
  }

  /**
   * @returns {Promise<import("./base-model.js").default}
   */
  async toArray() {
    const response = await this._response()
    const models = digg(response, "collection")

    this._addQueryToModels(models)

    return models
  }

  /**
   * @returns {typeof import("./base-model.js").default}
   */
  modelClass() {
    const modelName = digg(this.args.modelClass.modelClassData(), "name")

    return modelClassRequire(modelName)
  }

  /**
   * @returns {ApiMakerCollection}
   */
  clone() {
    const clonedQueryArgs = cloneDeep(this.queryArgs)

    return new ApiMakerCollection(this.args, clonedQueryArgs)
  }

  // This is needed when reloading a version of the model with the same selected attributes and preloads
  _addQueryToModels(models) {
    for (const model of models) {
      model.collection = this
    }
  }

  _merge(newQueryArgs) {
    incorporate(this.queryArgs, newQueryArgs)

    return this
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
}
