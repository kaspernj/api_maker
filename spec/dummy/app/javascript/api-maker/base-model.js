import CableConnectionPool from "./cable-connection-pool"
import Collection from "./collection"
import CommandsPool from "./commands-pool"
import { CustomError, ValidationError } from "./errors"
import FormDataToObject from "./form-data-to-object"
import ModelName from "./model-name"
import Money from "js-money"
import { objectToFormData } from "object-to-formdata"
import { ValidationErrors } from "./validation-errors"

const inflection = require("inflection")

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
      this.modelData = args.a
    } else if (args) {
      this.modelData = args
    } else {
      this.modelData = {}
    }
  }

  isAssociationLoaded(associationName) {
    if (associationName in this.relationshipsCache)
      return true

    return false
  }

  connect(eventName, callback) {
    const cableSubscription = CableConnectionPool.current().connectEvent(this.modelClassData().name, this._primaryKey(), eventName, callback)
    return cableSubscription
  }

  static connectCreated(callback) {
    const cableSubscription = CableConnectionPool.current().connectCreated(this.modelClassData().name, callback)
    return cableSubscription
  }

  connectDestroyed(callback) {
    const cableSubscription = CableConnectionPool.current().connectDestroyed(this.modelClassData().name, this._primaryKey(), callback)
    return cableSubscription
  }

  connectUpdated(callback) {
    const cableSubscription = CableConnectionPool.current().connectUpdate(this.modelClassData().name, this._primaryKey(), callback)
    return cableSubscription
  }

  assignAttributes(newAttributes) {
    for(const key in newAttributes) {
      const oldValue = this._getAttribute(key)
      const originalValue = this.modelData[key]
      const newValue = newAttributes[key]

      if (newValue != oldValue) {
        if (newValue == originalValue) {
          delete this.changes[key]
        } else {
          this.changes[key] = newValue
        }
      }
    }
  }

  cacheKey() {
    if (this.isPersisted()) {
      const keyParts = [
        this.modelClassData().paramKey,
        this._primaryKey()
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
      response = await CommandsPool.addCommand({args: dataToUse, command: `${this.modelClassData().collectionName}-create`, collectionName: this.modelClassData().collectionName, primaryKey: this._primaryKey(), type: "create"}, {})
    } catch (error) {
      this.parseValidationErrors(error, options)
      throw error
    }

    if (response.model) {
      this._setNewModelData(response.model.a)
      this.changes = {}
    }

    return {model: this, response: response}
  }

  async createRaw(rawData, options = {}) {
    const formData = FormDataToObject.formDataFromObject(rawData, options)
    const objectData = FormDataToObject.toObject(formData)
    let response

    try {
      response = await CommandsPool.addCommand({args: objectData, command: `${this.modelClassData().collectionName}-create`, collectionName: this.modelClassData().collectionName, primaryKey: this._primaryKey(), type: "create"}, {})
    } catch (error) {
      this.parseValidationErrors(error, options)
      throw error
    }

    if (response.model) {
      this._setNewModelData(response.model.a)
      this.changes = {}
    }

    return {model: this, response: response}
  }

  handleResponseError(response) {
    this.parseValidationErrors(response)
    throw new new CustomError("Response wasn't successful", {model: this, response: response})
  }

  parseValidationErrors(error, options) {
    if (!(error instanceof CustomError)) return
    if (!error.args.response.validation_errors) return

    const validationErrors = new ValidationErrors({
      model: this,
      validationErrors: error.args.response.validation_errors
    })

    if (validationErrors) this.sendValidationErrorsEvent(validationErrors, options)
    throw new ValidationError(validationErrors)
  }

  sendValidationErrorsEvent(validationErrors, options) {
    if (options && options.form) {
      const event = new CustomEvent("validation-errors", {detail: validationErrors})
      options.form.dispatchEvent(event)
    }
  }

  async destroy() {
    const response = await CommandsPool.addCommand({command: `${this.modelClassData().collectionName}-destroy`, collectionName: this.modelClassData().collectionName, primaryKey: this._primaryKey(), type: "destroy"}, {})

    if (response.success) {
      if (response.model) {
        this._setNewModelData(response.model.a)
        this.changes = {}
      }

      return {model: this, response: response}
    } else {
      handleResponseError(response)
    }
  }

  getAttributes() {
    return Object.assign(this.modelData, this.changes)
  }

  static humanAttributeName(attributeName) {
    const keyName = this.modelClassData().i18nKey
    return I18n.t(`activerecord.attributes.${keyName}.${BaseModel.snakeCase(attributeName)}`)
  }

  static snakeCase(string) {
    return inflection.underscore(string)
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

  _setNewModelData(modelData) {
    this.previousModelData = this.modelData
    this.modelData = modelData
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

  modelClassData() {
    return this.constructor.modelClassData()
  }

  async reload() {
    const primaryKeyName = this.modelClassData().primaryKey
    const query = {}
    query[`${primaryKeyName}_eq`] = this._primaryKey()

    const model = await this.constructor.ransack(query).first()
    this._setNewModelData(model.modelData)
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
      response = await CommandsPool.addCommand({args: dataToUse, command: `${this.modelClassData().collectionName}-update`, collectionName: this.modelClassData().collectionName, primaryKey: this._primaryKey(), type: "update"}, {})
    } catch (error) {
      this.parseValidationErrors(error, options)
      throw error
    }

    if (response.success) {
      if (response.model) {
        this._setNewModelData(response.model.a)
        this.changes = {}
      }

      return {response, model: this}
    } else {
      handleResponseError(response)
    }
  }

  async updateRaw(rawData, options = {}) {
    const formData = FormDataToObject.formDataFromObject(rawData, options)
    const objectData = FormDataToObject.toObject(formData)
    let response

    try {
      response = await CommandsPool.addCommand({args: objectData, command: `${this.modelClassData().collectionName}-update`, collectionName: this.modelClassData().collectionName, primaryKey: this._primaryKey(), type: "update"}, {})
    } catch (error) {
      this.parseValidationErrors(error, options)
      throw error
    }

    if (response.model) {
      this._setNewModelData(response.model.a)
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

    const response = await CommandsPool.addCommand({args: dataToUse, command: `${this.modelClassData().collectionName}-valid`, collectionName: this.modelClassData().collectionName, primaryKey: this._primaryKey(), type: "valid"}, {})

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

  _getAttribute(attributeName) {
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

  _getAttributeDateTime(attributeName) {
    const value = this._getAttribute(attributeName)

    if (!value) {
      return value
    } else if (value instanceof Date) {
      return value
    } else {
      return new Date(value)
    }
  }

  _isPresent(value) {
    if (!value) {
      return false
    } else if (typeof value == "string" && value.match(/^\s*$/)) {
      return false
    }

    return true
  }

  _getAttributeMoney(attributeName) {
    const value = this._getAttribute(attributeName)

    if (!value)
      return null

    const cents = value.amount
    const currency = value.currency
    return Money.fromInteger(cents, currency)
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
    this.modelData = args.data.a
    this.includedRelationships = args.data.r
  }

  _readIncludedRelationships(included) {
    if (!this.includedRelationships)
      return

    for(const relationshipName in this.includedRelationships) {
      const relationshipData = this.includedRelationships[relationshipName]
      const relationshipClassData = this.modelClassData().relationships.find(relationship => relationship.name == relationshipName)

      if (!relationshipClassData)
        throw new Error(`No relationship on ${this.modelClassData().name} by that name: ${relationshipName}`)

        const relationshipType = relationshipClassData.collectionName

      if (!relationshipData) {
        this.relationshipsCache[relationshipName] = null
      } else if (Array.isArray(relationshipData)) {
        const result = []

        for(const relationshipId of relationshipData) {
          const model = included.getModel(relationshipType, relationshipId)
          result.push(model)
        }

        this.relationshipsCache[relationshipName] = result
      } else {
        const model = included.getModel(relationshipType, relationshipData)
        this.relationshipsCache[relationshipName] = model
      }
    }
  }

  _primaryKey() {
    return this._getAttribute(this.modelClassData().primaryKey)
  }

  static _token() {
    const csrfTokenElement = document.querySelector("meta[name='csrf-token']")
    if (csrfTokenElement)
      return csrfTokenElement.getAttribute("content")
  }
}
