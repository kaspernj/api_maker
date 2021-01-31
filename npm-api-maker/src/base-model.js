import CableConnectionPool from "./cable-connection-pool"
import Collection from "./collection"
import CommandsPool from "./commands-pool"
import CustomError from "./custom-error"
import {digg} from "@kaspernj/object-digger"
import FormDataToObject from "./form-data-to-object"
import I18n from "./i18n"
import ModelName from "./model-name"
import ModelsResponseReader from "./models-response-reader"
import Services from "./services"
import ValidationError from "./validation-error"
import {ValidationErrors} from "./validation-errors"

const inflection = require("inflection")
const objectToFormData = require("object-to-formdata").serialize

export default class BaseModel {
  static modelClassData() {
    throw new Error("modelClassData should be overriden by child")
  }

  static async find(id) {
    const primaryKeyName = this.modelClassData().primaryKey
    const query = {}
    query[`${primaryKeyName}_eq`] = id

    const model = await this.ransack(query).first()

    if (model) {
      return model
    } else {
      throw new CustomError("Record not found")
    }
  }

  static async findOrCreateBy(findOrCreateByArgs, args = {}) {
    const result = await Services.current().sendRequest("Models::FindOrCreateBy", {
      additional_data: args.additionalData,
      find_or_create_by_args: findOrCreateByArgs,
      resource_name: digg(this.modelClassData(), "name"),
    })
    const model = digg(result, "model")

    return model
  }

  static modelName() {
    return new ModelName({modelClassData: this.modelClassData()})
  }

  static ransack(query = {}) {
    return new Collection({modelClass: this}, {ransack: query})
  }

  constructor(args = {}) {
    this.changes = {}
    this.newRecord = args.isNewRecord
    this.relationshipsCache = {}

    if (args && args.data && args.data.a) {
      this._readModelDataFromArgs(args)
    } else if (args.a) {
      this.abilities = args.b || {}
      this.modelData = args.a
    } else if (args) {
      this.abilities = {}
      this.modelData = args
    } else {
      this.abilities = {}
      this.modelData = {}
    }
  }

  assignAttributes(newAttributes) {
    for(const key in newAttributes) {
      const newValue = newAttributes[key]

      let applyChange = true
      let deleteChange = false

      if (this.isAttributeLoaded(key)) {
        const oldValue = this.readAttributeUnderscore(key)
        const originalValue = this.modelData[key]

        if (newValue == oldValue) {
          applyChange = false
        } else if (newValue == originalValue) {
          applyChange = false
          deleteChange = true
        }
      }

      if (applyChange) {
        this.changes[key] = newValue
      } else if (deleteChange) {
        delete this.changes[key]
      }
    }
  }

  can(givenAbilityName) {
    const abilityName = inflection.underscore(givenAbilityName)

    if (!(abilityName in this.abilities)) {
      throw new Error(`Ability ${abilityName} hasn't been loaded for ${this.modelClassData().name}`)
    }

    return this.abilities[abilityName]
  }

  clone() {
    const clone = new this.constructor

    clone.abilities = Object.assign({}, this.abilities)
    clone.modelData = Object.assign({}, this.modelData)
    clone.relationshipsCache = Object.assign({}, this.relationshipsCache)

    return clone
  }

  connect(eventName, callback) {
    const cableSubscription = CableConnectionPool.current().connectEvent(this.modelClassData().name, this.primaryKey(), eventName, callback)
    return cableSubscription
  }

  static connect(eventName, callback) {
    const cableSubscription = CableConnectionPool.current().connectModelClassEvent(this.modelClassData().name, eventName, callback)
    return cableSubscription
  }

  static connectCreated(callback) {
    const cableSubscription = CableConnectionPool.current().connectCreated(this.modelClassData().name, callback)
    return cableSubscription
  }

  connectDestroyed(callback) {
    const cableSubscription = CableConnectionPool.current().connectDestroyed(this.modelClassData().name, this.primaryKey(), callback)
    return cableSubscription
  }

  connectUpdated(callback) {
    const cableSubscription = CableConnectionPool.current().connectUpdate(this.modelClassData().name, this.primaryKey(), callback)
    return cableSubscription
  }

  cacheKey() {
    if (this.isPersisted()) {
      const keyParts = [
        this.modelClassData().paramKey,
        this.primaryKey()
      ]

      if ("updated_at" in this.modelData) {
        keyParts.push(`updatedAt-${this.updatedAt().getTime()}`)
      }

      return keyParts.join("-")
    } else {
      return this.uniqueKey()
    }
  }

  async create(attributes, options) {
    if (attributes) this.assignAttributes(attributes)
    const paramKey = this.modelClassData().paramKey
    const modelData = this.getAttributes()
    const dataToUse = {}
    dataToUse[paramKey] = modelData
    let response

    try {
      response = await CommandsPool.addCommand(
        {
          args: {
            save: dataToUse
          },
          command: `${this.modelClassData().collectionName}-create`,
          collectionName: this.modelClassData().collectionName,
          primaryKey: this.primaryKey(),
          type: "create"
        },
        {}
      )
    } catch (error) {
      this.parseValidationErrors(error, options)
      throw error
    }

    if (response.model) {
      this._refreshModelDataFromResponse(response)
      this.changes = {}
    }

    return {model: this, response}
  }

  async createRaw(rawData, options = {}) {
    const formData = FormDataToObject.formDataFromObject(rawData, options)
    const objectData = FormDataToObject.toObject(formData)
    let response

    try {
      response = await CommandsPool.addCommand(
        {
          args: {
            save: objectData
          },
          command: `${this.modelClassData().collectionName}-create`,
          collectionName: this.modelClassData().collectionName,
          primaryKey: this.primaryKey(),
          type: "create"},
        {}
      )
    } catch (error) {
      this.parseValidationErrors(error, options)
      throw error
    }

    if (response.model) {
      this._refreshModelDataFromResponse(response)
      this.changes = {}
    }

    return {model: this, response}
  }

  async destroy() {
    const response = await CommandsPool.addCommand(
      {
        args: {query_params: this.collection && this.collection.params()},
        command: `${this.modelClassData().collectionName}-destroy`,
        collectionName: this.modelClassData().collectionName,
        primaryKey: this.primaryKey(),
        type: "destroy"
      },
      {}
    )

    if (response.success) {
      if (response.model) {
        this._refreshModelDataFromResponse(response)
        this.changes = {}
      }

      return {model: this, response}
    } else {
      handleResponseError(response)
    }
  }

  async ensureAbilities(listOfAbilities) {
    // Populate an array with a list of abilities currently not loaded
    const abilitiesToLoad = []

    for (const abilityInList of listOfAbilities) {
      if (!(abilityInList in this.abilities)) {
        abilitiesToLoad.push(abilityInList)
      }
    }

    // Load the missing abilities if any
    if (abilitiesToLoad.length > 0) {
      const primaryKeyName = this.modelClassData().primaryKey
      const ransackParams = {}
      ransackParams[`${primaryKeyName}_eq`] = this.primaryKey()

      const abilitiesParams = {}
      abilitiesParams[this.modelClassData().name] = abilitiesToLoad

      const anotherModel = await this.constructor
        .ransack(ransackParams)
        .abilities(abilitiesParams)
        .first()

      if (!anotherModel) {
        throw new Error(`Could not look up the same model ${this.primaryKey()} with abilities: ${abilitiesToLoad.join(", ")}`)
      }

      const newAbilities = anotherModel.abilities
      for (const newAbility in newAbilities) {
        this.abilities[newAbility] = newAbilities[newAbility]
      }
    }
  }

  getAttributes() {
    return Object.assign(this.modelData, this.changes)
  }

  handleResponseError(response) {
    this.parseValidationErrors(response)
    throw new new CustomError("Response wasn't successful", {model: this, response})
  }

  isAssociationLoaded(associationName) {
    if (associationName in this.relationshipsCache) return true
    return false
  }

  parseValidationErrors(error, options) {
    if (!(error instanceof CustomError)) return
    if (!error.args.response.validation_errors) return

    const validationErrors = new ValidationErrors({
      model: this,
      validationErrors: digg(error, "args", "response", "validation_errors")
    })

    this.sendValidationErrorsEvent(validationErrors, options)
    throw new ValidationError(validationErrors)
  }

  sendValidationErrorsEvent(validationErrors, options) {
    if (options && options.form) {
      const event = new CustomEvent("validation-errors", {detail: validationErrors})
      options.form.dispatchEvent(event)
    }
  }

  static humanAttributeName(attributeName) {
    const keyName = this.modelClassData().i18nKey
    return I18n.t(`activerecord.attributes.${keyName}.${BaseModel.snakeCase(attributeName)}`)
  }

  isAttributeChanged(attributeName) {
    const attributeNameUnderscore = inflection.underscore(attributeName)
    const attributeData = this.modelClassData().attributes.find(attribute => attribute.name == attributeNameUnderscore)

    if (!attributeData) {
      const attributeNames = this.modelClassData().attributes.map(attribute => attribute.name)
      throw new Error(`Couldn't find an attribute by that name: "${attributeName}" in: ${attributeNames.join(", ")}`)
    }

    if (!(attributeNameUnderscore in this.changes))
      return false

    const oldValue = this.modelData[attributeNameUnderscore]
    const newValue = this.changes[attributeNameUnderscore]
    const changedMethod = this[`_is${inflection.camelize(attributeData.type, true)}Changed`]

    if (!changedMethod)
      throw new Error(`Don't know how to handle type: ${attributeData.type}`)

    return changedMethod(oldValue, newValue)
  }

  isChanged() {
    const keys = Object.keys(this.changes)

    if (keys.length > 0) {
      return true
    } else {
      return false
    }
  }

  isNewRecord() {
    if (this.newRecord === false) {
      return false
    } else if ("id" in this.modelData && this.modelData.id) {
      return false
    } else {
      return true
    }
  }

  isPersisted() {
    return !this.isNewRecord()
  }

  static snakeCase(string) {
    return inflection.underscore(string)
  }

  savedChangeToAttribute(attributeName) {
    if (!this.previousModelData)
      return false

    const attributeNameUnderscore = inflection.underscore(attributeName)
    const attributeData = this.modelClassData().attributes.find(attribute => attribute.name == attributeNameUnderscore)

    if (!attributeData) {
      const attributeNames = this.modelClassData().attributes.map(attribute => attribute.name)
      throw new Error(`Couldn't find an attribute by that name: "${attributeName}" in: ${attributeNames.join(", ")}`)
    }

    if (!(attributeNameUnderscore in this.previousModelData))
      return true

    const oldValue = this.previousModelData[attributeNameUnderscore]
    const newValue = this.modelData[attributeNameUnderscore]
    const changedMethodName = `_is${inflection.camelize(attributeData.type)}Changed`
    const changedMethod = this[changedMethodName]

    if (!changedMethod)
      throw new Error(`Don't know how to handle type: ${attributeData.type}`)

    return changedMethod(oldValue, newValue)
  }

  setNewModel(model) {
    this.setNewModelData(model)
    this.relationshipsCache = model.relationshipsCache
  }

  setNewModelData(model) {
    this.previousModelData = this.modelData
    this.modelData = model.modelData
  }

  _isDateChanged(oldValue, newValue) {
    if (Date.parse(oldValue) != Date.parse(newValue))
      return true
  }

  _isIntegerChanged(oldValue, newValue) {
    if (parseInt(oldValue) != parseInt(newValue))
      return true
  }

  _isStringChanged(oldValue, newValue) {
    const oldConvertedValue = `${oldValue}`
    const newConvertedValue = `${newValue}`

    if (oldConvertedValue != newConvertedValue)
      return true
  }

  modelClassData() {
    return this.constructor.modelClassData()
  }

  async reload() {
    const params = this.collection && this.collection.params()
    const primaryKeyName = this.modelClassData().primaryKey
    const ransackParams = {}
    ransackParams[`${primaryKeyName}_eq`] = this.primaryKey()

    let query = this.constructor.ransack(ransackParams)

    if (params) {
      if (params.preload) {
        query.queryArgs.preload = params.preload
      }

      if (params.select) {
        query.queryArgs.select = params.select
      }

      if (params.select_columns) {
        query.queryArgs.selectColumns = params.select_columns
      }
    }

    const model = await query.first()
    this.setNewModel(model)
    this.changes = {}
  }

  save() {
    if (this.isNewRecord()) {
      return this.create()
    } else {
      return this.update()
    }
  }

  saveRaw(rawData, options = {}) {
    if (this.isNewRecord()) {
      return this.createRaw(rawData, options)
    } else {
      return this.updateRaw(rawData, options)
    }
  }

  async update(newAttributes, options) {
    if (newAttributes)
      this.assignAttributes(newAttributes)

    if (this.changes.length == 0)
      return resolve({model: this})

    const paramKey = this.modelClassData().paramKey
    const modelData = this.changes
    const dataToUse = {}
    dataToUse[paramKey] = modelData
    let response

    try {
      response = await CommandsPool.addCommand(
        {
          args: {
            query_params: this.collection && this.collection.params(),
            save: dataToUse
          },
          command: `${this.modelClassData().collectionName}-update`,
          collectionName: this.modelClassData().collectionName,
          primaryKey: this.primaryKey(),
          type: "update"
        },
        {}
      )
    } catch (error) {
      this.parseValidationErrors(error, options)
      throw error
    }

    if (response.success) {
      if (response.model) {
        this._refreshModelDataFromResponse(response)
        this.changes = {}
      }

      return {response, model: this}
    } else {
      handleResponseError(response)
    }
  }

  _refreshModelDataFromResponse(response) {
    const newModel = ModelsResponseReader.first(response.model)
    this.setNewModel(newModel)
  }

  async updateRaw(rawData, options = {}) {
    const formData = FormDataToObject.formDataFromObject(rawData, options)
    const objectData = FormDataToObject.toObject(formData)
    let response

    try {
      response = await CommandsPool.addCommand(
        {
          args: {
            query_params: this.collection && this.collection.params(),
            save: objectData
          },
          command: `${this.modelClassData().collectionName}-update`,
          collectionName: this.modelClassData().collectionName,
          primaryKey: this.primaryKey(),
          type: "update"
        },
        {}
      )
    } catch (error) {
      this.parseValidationErrors(error, options)
      throw error
    }

    if (response.model) {
      this._refreshModelDataFromResponse(response)
      this.changes = {}
    }

    return {response, model: this}
  }

  isValid() {
    throw new Error("Not implemented yet")
  }

  async isValidOnServer() {
    const modelData = this.getAttributes()
    const paramKey = this.modelClassData().paramKey
    const dataToUse = {}
    dataToUse[paramKey] = modelData

    const response = await CommandsPool.addCommand(
      {
        args: {
          save: dataToUse
        },
        command: `${this.modelClassData().collectionName}-valid`,
        collectionName: this.modelClassData().collectionName,
        primaryKey: this.primaryKey(),
        type: "valid"
      },
      {}
    )

    return {valid: response.valid, errors: response.errors}
  }

  modelClass() {
    return this.constructor
  }

  preloadRelationship(relationshipName, model) {
    this.relationshipsCache[BaseModel.snakeCase(relationshipName)] = model
  }

  uniqueKey() {
    if (!this.uniqueKeyValue) {
      const min = 500000000000000000
      const max = 999999999999999999
      const randomBetween = Math.floor(Math.random() * (max - min + 1) + min)
      this.uniqueKeyValue = randomBetween
    }

    return this.uniqueKeyValue
  }

  static _callCollectionCommand(args, commandArgs) {
    return CommandsPool.addCommand(args, commandArgs)
  }

  _callMemberCommand(args, commandArgs) {
    return CommandsPool.addCommand(args, commandArgs)
  }

  static _postDataFromArgs(args) {
    let postData

    if (args) {
      if (args instanceof FormData) {
        postData = args
      } else {
        postData = objectToFormData(args, {}, null, "args")
      }
    } else {
      postData = new FormData()
    }

    return postData
  }

  readAttribute(attributeName) {
    const attributeNameUnderscore = inflection.underscore(attributeName)

    return this.readAttributeUnderscore(attributeNameUnderscore)
  }

  readAttributeUnderscore(attributeName) {
    if (attributeName in this.changes) {
      return this.changes[attributeName]
    } else if (attributeName in this.modelData) {
      return this.modelData[attributeName]
    } else if (this.isNewRecord()) {
      // Return null if this is a new record and the attribute name is a recognized attribute
      const attributes = this.modelClassData().attributes
      for(const attribute of attributes) {
        if (attribute.name == attributeName)
          return null
      }
    }

    throw new Error(`No such attribute: ${this.modelClassData().name}#${attributeName}`)
  }

  isAttributeLoaded(attributeName) {
    const attributeNameUnderscore = inflection.underscore(attributeName)

    if (attributeNameUnderscore in this.changes) return true
    if (attributeNameUnderscore in this.modelData) return true
    return false
  }

  _isPresent(value) {
    if (!value) {
      return false
    } else if (typeof value == "string" && value.match(/^\s*$/)) {
      return false
    }

    return true
  }

  async _loadBelongsToReflection(args, queryArgs = {}) {
    if (args.reflectionName in this.relationshipsCache) {
      return this.relationshipsCache[args.reflectionName]
    } else {
      const collection = new Collection(args, queryArgs)
      const model = await collection.first()
      this.relationshipsCache[args.reflectionName] = model
      return model
    }
  }

  _readBelongsToReflection(args) {
    if (!(args.reflectionName in this.relationshipsCache)) {
      if (this.isNewRecord())
        return null

      throw new Error(`${this.modelClassData().name}#${args.reflectionName} hasn't been loaded yet`)
    }

    return this.relationshipsCache[args.reflectionName]
  }

  async _loadHasManyReflection(args, queryArgs = {}) {
    if (args.reflectionName in this.relationshipsCache) {
      return this.relationshipsCache[args.reflectionName]
    } else {
      const collection = new Collection(args, queryArgs)
      const model = await collection.toArray()
      this.relationshipsCache[args.reflectionName] = model
      return model
    }
  }

  async _loadHasOneReflection(args, queryArgs = {}) {
    if (args.reflectionName in this.relationshipsCache) {
      return this.relationshipsCache[args.reflectionName]
    } else {
      const collection = new Collection(args, queryArgs)
      const model = await collection.first()
      this.relationshipsCache[args.reflectionName] = model
      return model
    }
  }

  _readHasOneReflection(args) {
    if (!(args.reflectionName in this.relationshipsCache)) {
      if (this.isNewRecord())
        return null

      throw new Error(`${this.modelClassData().name}#${args.reflectionName} hasn't been loaded yet`)
    }

    return this.relationshipsCache[args.reflectionName]
  }

  _readModelDataFromArgs(args) {
    this.abilities = args.data.b || {}
    this.collection = args.collection
    this.modelData = args.data.a
    this.preloadedRelationships = args.data.r
  }

  _readPreloadedRelationships(preloaded) {
    if (!this.preloadedRelationships)
      return

    for(const relationshipName in this.preloadedRelationships) {
      const relationshipData = this.preloadedRelationships[relationshipName]
      const relationshipClassData = this.modelClassData().relationships.find(relationship => relationship.name == relationshipName)

      if (!relationshipClassData)
        throw new Error(`No relationship on ${this.modelClassData().name} by that name: ${relationshipName}`)

        const relationshipType = relationshipClassData.collectionName

      if (!relationshipData) {
        this.relationshipsCache[relationshipName] = null
      } else if (Array.isArray(relationshipData)) {
        const result = []

        for(const relationshipId of relationshipData) {
          const model = preloaded.getModel(relationshipType, relationshipId)
          result.push(model)
        }

        this.relationshipsCache[relationshipName] = result
      } else {
        const model = preloaded.getModel(relationshipType, relationshipData)
        this.relationshipsCache[relationshipName] = model
      }
    }
  }

  primaryKey() {
    return this.readAttributeUnderscore(digg(this.modelClassData(), "primaryKey"))
  }

  static _token() {
    const csrfTokenElement = document.querySelector("meta[name='csrf-token']")
    if (csrfTokenElement)
      return csrfTokenElement.getAttribute("content")
  }
}
