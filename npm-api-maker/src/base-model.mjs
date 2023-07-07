import Attribute from "./base-model/attribute.mjs"
import AttributeNotLoadedError from "./attribute-not-loaded-error.mjs"
import CacheKeyGenerator from "./cache-key-generator.mjs"
import Collection from "./collection.mjs"
import CommandsPool from "./commands-pool.mjs"
import Config from "./config.mjs"
import CustomError from "./custom-error.mjs"
import {digg} from "diggerize"
import FormDataObjectizer from "form-data-objectizer"
import * as inflection from "inflection"
import ModelName from "./model-name.mjs"
import NotLoadedError from "./not-loaded-error.mjs"
import objectToFormData from "object-to-formdata"
import Reflection from "./base-model/reflection.mjs"
import Scope from "./base-model/scope.mjs"
import Services from "./services.mjs"
import ValidationError from "./validation-error.mjs"
import {ValidationErrors} from "./validation-errors.mjs"

export default class BaseModel {
  static apiMakerType = "BaseModel"

  static attributes() {
    const attributes = digg(this.modelClassData(), "attributes")
    const result = []

    for (const attributeKey in attributes) {
      const attributeData = attributes[attributeKey]
      const attribute = new Attribute(attributeData)

      result.push(attribute)
    }

    return result
  }

  static hasAttribute(attributeName) {
    const attributes = digg(this.modelClassData(), "attributes")
    const lowerCaseAttributeName = inflection.underscore(attributeName)

    if (lowerCaseAttributeName in attributes) return true

    return false
  }

  static modelClassData() {
    throw new Error("modelClassData should be overriden by child")
  }

  static newCustomEvent = (validationErrors) => {
    return new CustomEvent("validation-errors", {detail: validationErrors})
  }

  static sendValidationErrorsEvent = (validationErrors, options) => {
    if (options && options.form) {
      const event = BaseModel.newCustomEvent(validationErrors)
      options.form.dispatchEvent(event)
    }
  }

  static async find(id) {
    const query = {}

    query[`${this.primaryKey()}_eq`] = id

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
      resource_name: digg(this.modelClassData(), "name")
    })
    const model = digg(result, "model")

    return model
  }

  static modelName() {
    return new ModelName({modelClassData: this.modelClassData()})
  }

  static primaryKey() {
    return digg(this.modelClassData(), "primaryKey")
  }

  static ransack(query = {}) {
    return new Collection({modelClass: this}, {ransack: query})
  }

  static ransackableAssociations() {
    const relationships = digg(this.modelClassData(), "ransackable_associations")
    const reflections = []

    for (const relationshipData of relationships) {
      reflections.push(new Reflection(relationshipData))
    }

    return reflections
  }

  static ransackableAttributes() {
    const attributes = digg(this.modelClassData(), "ransackable_attributes")
    const result = []

    for (const attributeData of attributes) {
      result.push(new Attribute(attributeData))
    }

    return result
  }

  static ransackableScopes() {
    const ransackableScopes = digg(this.modelClassData(), "ransackable_scopes")
    const result = []

    for (const scopeData of ransackableScopes) {
      const scope = new Scope(scopeData)

      result.push(scope)
    }

    return result
  }

  static reflections() {
    const relationships = digg(this.modelClassData(), "relationships")
    const reflections = []

    for (const relationshipData of relationships) {
      const reflection = new Reflection(relationshipData)

      reflections.push(reflection)
    }

    return reflections
  }

  constructor (args = {}) {
    this.changes = {}
    this.newRecord = args.isNewRecord
    this.relationshipsCache = {}
    this.relationships = {}

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

  assignAttributes (newAttributes) {
    for (const key in newAttributes) {
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

  attributes () {
    return digg(this, "modelData")
  }

  can (givenAbilityName) {
    const abilityName = inflection.underscore(givenAbilityName)

    if (!(abilityName in this.abilities)) {
      throw new Error(`Ability ${abilityName} hasn't been loaded for ${digg(this.modelClassData(), "name")}`)
    }

    return this.abilities[abilityName]
  }

  clone () {
    const clone = new this.constructor()

    clone.abilities = {...this.abilities}
    clone.modelData = {...this.modelData}
    clone.relationships = {...this.relationships}
    clone.relationshipsCache = {...this.relationshipsCache}

    return clone
  }

  cacheKey () {
    if (this.isPersisted()) {
      const keyParts = [
        this.modelClassData().paramKey,
        this.primaryKey()
      ]

      if ("updated_at" in this.modelData) {
        const updatedAt = this.updatedAt()

        if (typeof updatedAt != "object") {
          throw new Error(`updatedAt wasn't an object: ${typeof updatedAt}`)
        } else if (!("getTime" in updatedAt)) {
          throw new Error(`updatedAt didn't support getTime with class: ${updatedAt.constructor && updatedAt.constructor.name}`)
        }

        keyParts.push(`updatedAt-${this.updatedAt().getTime()}`)
      }

      return keyParts.join("-")
    } else {
      return this.uniqueKey()
    }
  }

  fullCacheKey() {
    const cacheKeyGenerator = new CacheKeyGenerator(this)

    return cacheKeyGenerator.cacheKey()
  }

  static all () {
    return this.ransack()
  }

  async create (attributes, options) {
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
      BaseModel.parseValidationErrors({error, model: this, options})
      throw error
    }

    if (response.model) {
      this._refreshModelFromResponse(response)
      this.changes = {}
    }

    return {model: this, response}
  }

  async createRaw (rawData, options = {}) {
    const objectData = BaseModel._objectDataFromGivenRawData(rawData, options)

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
          type: "create"
        },
        {}
      )
    } catch (error) {
      BaseModel.parseValidationErrors({error, model: this, options})
      throw error
    }

    if (response.model) {
      this._refreshModelDataFromResponse(response)
      this.changes = {}
    }

    return {model: this, response}
  }

  async destroy () {
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
      this.handleResponseError(response)
    }
  }

  async ensureAbilities (listOfAbilities) {
    // Populate an array with a list of abilities currently not loaded
    const abilitiesToLoad = []

    for (const abilityInList of listOfAbilities) {
      if (!(abilityInList in this.abilities)) {
        abilitiesToLoad.push(abilityInList)
      }
    }

    // Load the missing abilities if any
    if (abilitiesToLoad.length > 0) {
      const primaryKeyName = this.constructor.primaryKey()
      const ransackParams = {}
      ransackParams[`${primaryKeyName}_eq`] = this.primaryKey()

      const abilitiesParams = {}
      abilitiesParams[digg(this.modelClassData(), "name")] = abilitiesToLoad

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

  getAttributes () {
    return Object.assign(this.modelData, this.changes)
  }

  handleResponseError (response) {
    BaseModel.parseValidationErrors({model: this, response})
    throw new new CustomError("Response wasn't successful", {model: this, response})
  }

  identifierKey () {
    if (!this._identifierKey) this._identifierKey = this.isPersisted() ? this.primaryKey() : this.uniqueKey()

    return this._identifierKey
  }

  isAssociationLoaded (associationName) {
    if (associationName in this.relationshipsCache) return true
    return false
  }

  isAssociationPresent (associationName) {
    if (this.isAssociationLoaded(associationName)) return true
    if (associationName in this.relationships) return true
    return false
  }

  static parseValidationErrors ({error, model, options}) {
    if (!(error instanceof ValidationError)) return
    if (!error.args.response.validation_errors) return

    const validationErrors = new ValidationErrors({
      model,
      validationErrors: digg(error, "args", "response", "validation_errors")
    })

    BaseModel.sendValidationErrorsEvent(validationErrors, options)

    if (!options || options.throwValidationError != false) {
      throw new ValidationError(validationErrors, digg(error, "args"))
    }
  }

  static humanAttributeName (attributeName) {
    const keyName = digg(this.modelClassData(), "i18nKey")
    const i18n = Config.getI18n()

    if (i18n) return i18n.t(`activerecord.attributes.${keyName}.${BaseModel.snakeCase(attributeName)}`, {defaultValue: attributeName})

    return inflection.humanize(attributeName)
  }

  isAttributeChanged (attributeName) {
    const attributeNameUnderscore = inflection.underscore(attributeName)
    const attributeData = this.modelClassData().attributes.find((attribute) => digg(attribute, "name") == attributeNameUnderscore)

    if (!attributeData) {
      const attributeNames = this.modelClassData().attributes.map((attribute) => digg(attribute, "name"))

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

  isChanged () {
    const keys = Object.keys(this.changes)

    if (keys.length > 0) {
      return true
    } else {
      return false
    }
  }

  isNewRecord () {
    if (this.newRecord !== undefined) {
      return this.newRecord
    } else if ("id" in this.modelData && this.modelData.id) {
      return false
    } else {
      return true
    }
  }

  isPersisted () {
    return !this.isNewRecord()
  }

  static snakeCase (string) {
    return inflection.underscore(string)
  }

  savedChangeToAttribute (attributeName) {
    if (!this.previousModelData)
      return false

    const attributeNameUnderscore = inflection.underscore(attributeName)
    const attributeData = this.modelClassData().attributes.find((attribute) => attribute.name == attributeNameUnderscore)

    if (!attributeData) {
      const attributeNames = this.modelClassData().attributes.map((attribute) => attribute.name)
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

  setNewModel (model) {
    this.setNewModelData(model)
    this.relationships = digg(model, "relationships")
    this.relationshipsCache = digg(model, "relationshipsCache")
  }

  setNewModelData (model) {
    if (!("modelData" in model)) throw new Error(`No modelData in model: ${JSON.stringify(model)}`)

    this.previousModelData = digg(this, "modelData")
    this.modelData = digg(model, "modelData")
  }

  _isDateChanged (oldValue, newValue) {
    if (Date.parse(oldValue) != Date.parse(newValue))
      return true
  }

  _isIntegerChanged (oldValue, newValue) {
    if (parseInt(oldValue, 10) != parseInt(newValue, 10))
      return true
  }

  _isStringChanged (oldValue, newValue) {
    const oldConvertedValue = `${oldValue}`
    const newConvertedValue = `${newValue}`

    if (oldConvertedValue != newConvertedValue)
      return true
  }

  modelClassData () {
    return this.constructor.modelClassData()
  }

  async reload () {
    const params = this.collection && this.collection.params()
    const ransackParams = {}
    ransackParams[`${this.constructor.primaryKey()}_eq`] = this.primaryKey()

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

  save () {
    if (this.isNewRecord()) {
      return this.create()
    } else {
      return this.update()
    }
  }

  saveRaw (rawData, options = {}) {
    if (this.isNewRecord()) {
      return this.createRaw(rawData, options)
    } else {
      return this.updateRaw(rawData, options)
    }
  }

  async update (newAttributes, options) {
    if (newAttributes)
      this.assignAttributes(newAttributes)

    if (Object.keys(this.changes).length == 0) {
      return {model: this}
    }

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
      BaseModel.parseValidationErrors({error, model: this, options})
      throw error
    }

    if (response.success) {
      if (response.model) {
        this._refreshModelFromResponse(response)
        this.changes = {}
      }

      return {response, model: this}
    } else {
      this.handleResponseError(response)
    }
  }

  _refreshModelFromResponse (response) {
    let newModel = digg(response, "model")

    if (Array.isArray(newModel)) newModel = newModel[0]

    this.setNewModel(newModel)
  }

  _refreshModelDataFromResponse (response) {
    let newModel = digg(response, "model")

    if (Array.isArray(newModel)) newModel = newModel[0]

    this.setNewModelData(newModel)
  }

  static _objectDataFromGivenRawData (rawData, options) {
    if (rawData instanceof FormData || rawData.nodeName == "FORM") {
      const formData = FormDataObjectizer.formDataFromObject(rawData, options)

      return FormDataObjectizer.toObject(formData)
    }

    return rawData
  }

  async updateRaw (rawData, options = {}) {
    const objectData = BaseModel._objectDataFromGivenRawData(rawData, options)
    let response

    try {
      response = await CommandsPool.addCommand(
        {
          args: {
            query_params: this.collection && this.collection.params(),
            save: objectData,
            simple_model_errors: options?.simpleModelErrors
          },
          command: `${this.modelClassData().collectionName}-update`,
          collectionName: this.modelClassData().collectionName,
          primaryKey: this.primaryKey(),
          type: "update"
        },
        {}
      )
    } catch (error) {
      BaseModel.parseValidationErrors({error, model: this, options})
      throw error
    }

    if (response.model) {
      this._refreshModelFromResponse(response)
      this.changes = {}
    }

    return {response, model: this}
  }

  isValid () {
    throw new Error("Not implemented yet")
  }

  async isValidOnServer () {
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

  modelClass () {
    return this.constructor
  }

  preloadRelationship (relationshipName, model) {
    this.relationshipsCache[BaseModel.snakeCase(relationshipName)] = model
    this.relationships[BaseModel.snakeCase(relationshipName)] = model
  }

  uniqueKey () {
    if (!this.uniqueKeyValue) {
      const min = 5000000000000000
      const max = 9007199254740991
      const randomBetween = Math.floor(Math.random() * (max - min + 1) + min)
      this.uniqueKeyValue = randomBetween
    }

    return this.uniqueKeyValue
  }

  static async _callCollectionCommand (args, commandArgs) {
    const formOrDataObject = args.args

    try {
      return await CommandsPool.addCommand(args, commandArgs)
    } catch (error) {
      let form

      if (commandArgs.form) {
        form = commandArgs.form
      } else if (formOrDataObject?.nodeName == "FORM") {
        form = formOrDataObject
      }

      if (form) BaseModel.parseValidationErrors({error, options: {form}})

      throw error
    }
  }

  _callMemberCommand (args, commandArgs) {
    return CommandsPool.addCommand(args, commandArgs)
  }

  static _postDataFromArgs (args) {
    let postData

    if (args) {
      if (args instanceof FormData) {
        postData = args
      } else {
        postData = objectToFormData.serialize(args, {}, null, "args")
      }
    } else {
      postData = new FormData()
    }

    return postData
  }

  readAttribute (attributeName) {
    const attributeNameUnderscore = inflection.underscore(attributeName)

    return this.readAttributeUnderscore(attributeNameUnderscore)
  }

  readAttributeUnderscore (attributeName) {
    if (attributeName in this.changes) {
      return this.changes[attributeName]
    } else if (attributeName in this.modelData) {
      return this.modelData[attributeName]
    } else if (this.isNewRecord()) {
      // Return null if this is a new record and the attribute name is a recognized attribute
      const attributes = digg(this.modelClassData(), "attributes")

      if (attributeName in attributes) return null
    }

    if (this.isPersisted()) {
      throw new AttributeNotLoadedError(`No such attribute: ${digg(this.modelClassData(), "name")}#${attributeName}: ${JSON.stringify(this.modelData)}`)
    }
  }

  isAttributeLoaded (attributeName) {
    const attributeNameUnderscore = inflection.underscore(attributeName)

    if (attributeNameUnderscore in this.changes) return true
    if (attributeNameUnderscore in this.modelData) return true
    return false
  }

  _isPresent (value) {
    if (!value) {
      return false
    } else if (typeof value == "string" && value.match(/^\s*$/)) {
      return false
    }

    return true
  }

  async _loadBelongsToReflection (args, queryArgs = {}) {
    if (args.reflectionName in this.relationships) {
      return this.relationships[args.reflectionName]
    } else if (args.reflectionName in this.relationshipsCache) {
      return this.relationshipsCache[args.reflectionName]
    } else {
      const collection = new Collection(args, queryArgs)
      const model = await collection.first()
      this.relationshipsCache[args.reflectionName] = model
      return model
    }
  }

  _readBelongsToReflection ({reflectionName}) {
    if (reflectionName in this.relationships) {
      return this.relationships[reflectionName]
    } else if (reflectionName in this.relationshipsCache) {
      return this.relationshipsCache[reflectionName]
    }

    if (this.isNewRecord()) return null

    const loadedRelationships = Object.keys(this.relationshipsCache)
    const modelClassName = digg(this.modelClassData(), "name")

    throw new NotLoadedError(`${modelClassName}#${reflectionName} hasn't been loaded yet. Only these were loaded: ${loadedRelationships.join(", ")}`)
  }

  async _loadHasManyReflection (args, queryArgs = {}) {
    if (args.reflectionName in this.relationships) {
      return this.relationships[args.reflectionName]
    } else if (args.reflectionName in this.relationshipsCache) {
      return this.relationshipsCache[args.reflectionName]
    }

    const collection = new Collection(args, queryArgs)
    const models = await collection.toArray()

    this.relationshipsCache[args.reflectionName] = models

    return models
  }

  async _loadHasOneReflection (args, queryArgs = {}) {
    if (args.reflectionName in this.relationships) {
      return this.relationships[args.reflectionName]
    } else if (args.reflectionName in this.relationshipsCache) {
      return this.relationshipsCache[args.reflectionName]
    } else {
      const collection = new Collection(args, queryArgs)
      const model = await collection.first()

      this.relationshipsCache[args.reflectionName] = model

      return model
    }
  }

  _readHasOneReflection ({reflectionName}) {
    if (args.reflectionName in this.relationships) {
      return this.relationships[args.reflectionName]
    } else if (args.reflectionName in this.relationshipsCache) {
      return this.relationshipsCache[args.reflectionName]
    }

    if (this.isNewRecord())
      return null

    const loadedRelationships = Object.keys(this.relationshipsCache)
    const modelClassName = digg(this.modelClassData(), "name")

    throw new NotLoadedError(`${modelClassName}#${reflectionName} hasn't been loaded yet. Only these were loaded: ${loadedRelationships.join(", ")}`)
  }

  _readModelDataFromArgs (args) {
    this.abilities = args.data.b || {}
    this.collection = args.collection
    this.modelData = args.data.a
    this.preloadedRelationships = args.data.r
  }

  _readPreloadedRelationships (preloaded) {
    if (!this.preloadedRelationships) {
      return
    }

    const relationships = digg(this.modelClassData(), "relationships")

    for (const relationshipName in this.preloadedRelationships) {
      const relationshipData = this.preloadedRelationships[relationshipName]
      const relationshipClassData = relationships.find((relationship) => digg(relationship, "name") == relationshipName)

      if (!relationshipClassData) {
        const modelName = digg(this.modelClassData(), "name")
        const relationshipsList = relationships.map((relationship) => relationship.name).join(", ")

        throw new Error(`Could not find the relation ${relationshipName} on the ${modelName} model: ${relationshipsList}`)
      }

      const relationshipType = digg(relationshipClassData, "collectionName")

      if (relationshipName in this.relationshipsCache) {
        throw new Error(`${relationshipName} has already been loaded`)
      }

      if (!relationshipClassData) {
        throw new Error(`No relationship on ${digg(this.modelClassData(), "name")} by that name: ${relationshipName}`)
      }

      if (!relationshipData) {
        this.relationshipsCache[relationshipName] = null
        this.relationships[relationshipName] = null
      } else if (Array.isArray(relationshipData)) {
        this.relationshipsCache[relationshipName] = []
        this.relationships[relationshipName] = []

        for (const relationshipId of relationshipData) {
          const model = preloaded.getModel(relationshipType, relationshipId)

          this.relationshipsCache[relationshipName].push(model)
          this.relationships[relationshipName].push(model)
        }
      } else {
        const model = preloaded.getModel(relationshipType, relationshipData)

        this.relationshipsCache[relationshipName] = model
        this.relationships[relationshipName] = model
      }
    }
  }

  primaryKey () {
    return this.readAttributeUnderscore(this.constructor.primaryKey())
  }

  static _token () {
    const csrfTokenElement = document.querySelector("meta[name='csrf-token']")

    if (csrfTokenElement) {
      return csrfTokenElement.getAttribute("content")
    }
  }
}
