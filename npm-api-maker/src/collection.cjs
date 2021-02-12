const cloneDeep = require("clone-deep")
const CommandsPool = require("./commands-pool.cjs")
const {digg} = require("@kaspernj/object-digger")
const inflection = require("inflection")
const {merge} = require("./merge.cjs")
const ModelsResponseReader = require("./models-response-reader.cjs")
const Result = require("./result.cjs")

module.exports = class Collection {
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

    return this._merge({abilities: newAbilities})
  }

  accessibleBy(abilityName) {
    return this._merge({accessibleBy: abilityName})
  }

  async count() {
    const response = await this.clone({count: true})._response()

    return response.count
  }

  distinct() {
    return this._merge({distinct: true})
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

  isLoaded() {
    if (this.args.reflectionName in this.args.model.relationshipsCache)
      return true

    return false
  }

  limit(amount) {
    return this._merge({limit: amount})
  }

  loaded() {
    if (!(this.args.reflectionName in this.args.model.relationshipsCache)) {
      throw new Error(`${this.args.reflectionName} hasnt been loaded yet`)
    }

    return this.args.model.relationshipsCache[this.args.reflectionName]
  }

  preload(preloadValue) {
    return this._merge({preload: preloadValue})
  }

  page(page) {
    if (!page)
      page = 1

    return this._merge({page})
  }

  pageKey(pageKey) {
    return this._merge({pageKey})
  }

  params() {
    let params = {}

    if (this.queryArgs.params) params = merge(params, this.queryArgs.params)
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
    return this._merge({per})
  }

  perKey(perKey) {
    return this._merge({perKey})
  }

  ransack(params) {
    return this._merge({ransack: params})
  }

  async result() {
    const response = await this._response()
    const models = this._responseToModels(response)
    const result = new Result({collection: this, models, response})
    return result
  }

  searchKey(searchKey) {
    return this._merge({searchKey: searchKey})
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

    return this._merge({select: newSelect})
  }

  selectColumns(originalSelect) {
    const newSelect = {}

    for(const originalModelName in originalSelect) {
      const newModelName = inflection.dasherize(inflection.underscore(originalModelName))
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

  sort(sortBy) {
    return this._merge({ransack: {s: sortBy}})
  }

  async toArray() {
    const response = await this._response()
    return this._responseToModels(response)
  }

  modelClass() {
    const modelName = digg(this.args.modelClass.modelClassData(), "name")

    return digg(require("api-maker/models"), modelName)
  }

  clone() {
    const clonedQueryArgs = cloneDeep(this.queryArgs)

    return new Collection(this.args, clonedQueryArgs)
  }

  _merge(newQueryArgs) {
    merge(this.queryArgs, newQueryArgs)

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

  _responseToModels(response) {
    const modelsResponseReader = new ModelsResponseReader({
      collection: this,
      response
    })
    return modelsResponseReader.models()
  }
}
