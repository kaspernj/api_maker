import CableConnectionPool from "./cable-connection-pool"
import Collection from "./collection"
import CommandsPool from "./commands-pool"
import FormDataToObject from "./form-data-to-object"
import ModelName from "./model-name"
import Money from "js-money"
import objectToFormData from "object-to-formdata"

const inflection = require("inflection")

export default class BaseModel {
  static modelClassData() {
    throw new Error("modelClassData should be overriden by child")
  }

  static find(id) {
    return new Promise((resolve, reject) => {
      var primaryKeyName = this.modelClassData().primaryKey
      var query = {}
      query[`${primaryKeyName}_eq`] = id

      this.ransack(query).first().then(model => {
        if (model) {
          resolve(model)
        } else {
          reject(error)
        }
      })
    })
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

    if (args && args.data && args.data.attributes) {
      this._readModelDataFromArgs(args)
    } else if (args.attributes) {
      this.modelData = args.attributes
    } else if (args) {
      this.modelData = args
    } else {
      this.modelData = {}
    }
  }

  connect(eventName, callback) {
    var cableSubscription = CableConnectionPool.current().connectEvent(this.modelClassData().name, this._primaryKey(), eventName, callback)
    return cableSubscription
  }

  connectUpdated(callback) {
    var cableSubscription = CableConnectionPool.current().connectUpdate(this.modelClassData().name, this._primaryKey(), callback)
    return cableSubscription
  }

  connectDestroyed(callback) {
    var cableSubscription = CableConnectionPool.current().connectDestroyed(this.modelClassData().name, this._primaryKey(), callback)
    return cableSubscription
  }

  assignAttributes(newAttributes) {
    for(var key in newAttributes) {
      var oldValue = this._getAttribute(key)
      var originalValue = this.modelData[key]
      var newValue = newAttributes[key]

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
      var keyParts = [
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

  create() {
    return new Promise((resolve, reject) => {
      var paramKey = this.modelClassData().paramKey
      var modelData = this.getAttributes()
      var dataToUse = {}
      dataToUse[paramKey] = modelData

      CommandsPool.addCommand({args: dataToUse, command: `${this.modelClassData().collectionKey}-create`, collectionKey: this.modelClassData().collectionKey, primaryKey: this._primaryKey(), type: "create"}, {})
        .then(response => {
          if (response.success) {
            if (response.model) {
              this._setNewModelData(response.model.attributes)
              this.changes = {}
            }

            resolve({model: this, response: response})
          } else {
            reject({model: this, response: response})
          }
        }, (response) => {
          reject({model: this, response: response})
        })
    })
  }

  createRaw(data) {
    return new Promise((resolve, reject) => {
      var formData = FormDataToObject.toObject(data)

      CommandsPool.addCommand({args: formData, command: `${this.modelClassData().collectionKey}-create`, collectionKey: this.modelClassData().collectionKey, primaryKey: this._primaryKey(), type: "create"}, {})
        .then(response => {
          if (response.success) {
            if (response.model) {
              this._setNewModelData(response.model.attributes)
              this.changes = {}
            }

            resolve({model: this, response: response})
          } else {
            reject({model: this, response: response})
          }
        }, (response) => {
          reject({model: this, response: response})
        })
    })
  }

  destroy() {
    return new Promise((resolve, reject) => {
      CommandsPool.addCommand({command: `${this.modelClassData().collectionKey}-destroy`, collectionKey: this.modelClassData().collectionKey, primaryKey: this._primaryKey(), type: "destroy"}, {})
        .then((response) => {
          if (response.success) {
            if (response.model) {
              this._setNewModelData(response.model.attributes)
              this.changes = {}
            }

            resolve({model: this, response: response})
          } else {
            reject({model: this, response: response})
          }
        }, (response) => {
          reject({model: this, response: response})
        })
    })
  }

  getAttributes() {
    return Object.assign(this.modelData, this.changes)
  }

  static humanAttributeName(attributeName) {
    var keyName = this.modelClassData().i18nKey
    return I18n.t(`activerecord.attributes.${keyName}.${BaseModel.snakeCase(attributeName)}`)
  }

  static snakeCase(string) {
    return inflection.underscore(string)
  }

  isAttributeChanged(attributeName) {
    var attributeNameUnderscore = inflection.underscore(attributeName)
    var attributeData = this.modelClassData().attributes.find(attribute => attribute.name == attributeNameUnderscore)

    if (!attributeData) {
      var attributeNames = this.modelClassData().attributes.map(attribute => attribute.name)
      throw new Error(`Couldn't find an attribute by that name: "${attributeName}" in: ${attributeNames.join(", ")}`)
    }

    if (!(attributeNameUnderscore in this.changes))
      return false

    var oldValue = this.modelData[attributeNameUnderscore]
    var newValue = this.changes[attributeNameUnderscore]
    var changedMethod = this[`_is${inflection.camelize(attributeData.type, true)}Changed`]

    if (!changedMethod)
      throw new Error(`Don't know how to handle type: ${attributeData.type}`)

    return changedMethod(oldValue, newValue)
  }

  savedChangeToAttribute(attributeName) {
    if (!this.previousModelData)
      return false

    var attributeNameUnderscore = inflection.underscore(attributeName)
    var attributeData = this.modelClassData().attributes.find(attribute => attribute.name == attributeNameUnderscore)

    if (!attributeData) {
      var attributeNames = this.modelClassData().attributes.map(attribute => attribute.name)
      throw new Error(`Couldn't find an attribute by that name: "${attributeName}" in: ${attributeNames.join(", ")}`)
    }

    if (!(attributeNameUnderscore in this.previousModelData))
      return true

    var oldValue = this.previousModelData[attributeNameUnderscore]
    var newValue = this.modelData[attributeNameUnderscore]
    var changedMethodName = `_is${inflection.camelize(attributeData.type)}Changed`
    var changedMethod = this[changedMethodName]

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
    var oldConvertedValue = `${oldValue}`
    var newConvertedValue = `${newValue}`

    if (oldConvertedValue != newConvertedValue)
      return true
  }

  isChanged() {
    var keys = Object.keys(this.changes)

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

  reload() {
    return new Promise(resolve => {
      var primaryKeyName = this.modelClassData().primaryKey
      var query = {}
      query[`${primaryKeyName}_eq`] = this._primaryKey()

      this.constructor.ransack(query).first().then(model => {
        this._setNewModelData(model.modelData)
        this.changes = {}
        resolve()
      })
    })
  }

  save() {
    if (this.isNewRecord()) {
      return this.create()
    } else {
      return this.update()
    }
  }

  saveRaw(rawData) {
    if (this.isNewRecord()) {
      return this.createRaw(rawData)
    } else {
      return this.updateRaw(rawData)
    }
  }

  update(newAttributes = null) {
    if (newAttributes)
      this.assignAttributes(newAttributes)

    return new Promise((resolve, reject) => {
      if (this.changes.length == 0)
        return resolve({model: this})

      var paramKey = this.modelClassData().paramKey
      var modelData = this.changes
      var dataToUse = {}
      dataToUse[paramKey] = modelData

      CommandsPool.addCommand({args: dataToUse, command: `${this.modelClassData().collectionKey}-update`, collectionKey: this.modelClassData().collectionKey, primaryKey: this._primaryKey(), type: "update"}, {})
        .then((response) => {
          if (response.success) {
            if (response.model) {
              this._setNewModelData(response.model.attributes)
              this.changes = {}
            }

            resolve({"model": this, "response": response})
          } else {
            reject({"model": this, "response": response})
          }
        }, (response) => {
          reject({model: this, response: response})
        })
    })
  }

  updateRaw(data) {
    return new Promise((resolve, reject) => {
      var formData = FormDataToObject.toObject(data)

      CommandsPool.addCommand({args: formData, command: `${this.modelClassData().collectionKey}-update`, collectionKey: this.modelClassData().collectionKey, primaryKey: this._primaryKey(), type: "update"}, {})
        .then((response) => {
          if (response.success) {
            if (response.model) {
              this._setNewModelData(response.model.attributes)
              this.changes = {}
            }

            resolve({model: this, response: response})
          } else {
            reject({model: this, response: response})
          }
        }, (response) => {
          reject({model: this, response: response})
        })
    })
  }

  isValid() {
    throw new Error("Not implemented yet")
  }

  isValidOnServer() {
    return new Promise((resolve, reject) => {
      var modelData = this.getAttributes()
      var paramKey = this.modelClassData().paramKey
      var dataToUse = {}
      dataToUse[paramKey] = modelData

      CommandsPool.addCommand({args: dataToUse, command: `${this.modelClassData().collectionKey}-valid`, collectionKey: this.modelClassData().collectionKey, primaryKey: this._primaryKey(), type: "valid"}, {})
        .then((response) => {
          resolve({valid: response.valid, errors: response.errors})
        }, (response) => {
          reject({model: this, response: response})
        })
    })
  }

  modelClass() {
    return this.constructor
  }

  preloadRelationship(relationshipName, model) {
    this.relationshipsCache[BaseModel.snakeCase(relationshipName)] = model
  }

  uniqueKey() {
    if (!this.uniqueKeyValue) {
      var min = 500000000000000000
      var max = 999999999999999999
      var randomBetween = Math.floor(Math.random() * (max - min + 1) + min)
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
    var postData

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
      var attributes = this.modelClassData().attributes
      for(var attribute of attributes) {
        if (attribute.name == attributeName)
          return null
      }
    }

    throw new Error(`No such attribute: ${attributeName}`)
  }

  _getAttributeDateTime(attributeName) {
    var value = this._getAttribute(attributeName)

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
    var value = this._getAttribute(attributeName)

    if (!value)
      return null

    var cents = value.amount
    var currency = value.currency
    return Money.fromInteger(cents, currency)
  }

  _loadBelongsToReflection(args, queryArgs = {}) {
    return new Promise((resolve, reject) => {
      if (args.reflectionName in this.relationshipsCache) {
        resolve(this.relationshipsCache[args.reflectionName])
      } else {
        var collection = new Collection(args, queryArgs)
        collection.first().then(model => {
          this.relationshipsCache[args.reflectionName] = model
          resolve(model)
        })
      }
    })
  }

  _readBelongsToReflection(args) {
    if (!(args.reflectionName in this.relationshipsCache)) {
      if (this.isNewRecord())
        return null

      throw new Error(`${args.reflectionName} hasnt been loaded yet`)
    }

    return this.relationshipsCache[args.reflectionName]
  }

  _loadHasOneReflection(args, queryArgs = {}) {
    return new Promise((resolve, reject) => {
      if (args.reflectionName in this.relationshipsCache) {
        resolve(this.relationshipsCache[args.reflectionName])
      } else {
        var collection = new Collection(args, queryArgs)
        collection.first().then(model => {
          this.relationshipsCache[args.reflectionName] = model
          resolve(model)
        })
      }
    })
  }

  _readHasOneReflection(args) {
    if (!(args.reflectionName in this.relationshipsCache)) {
      if (this.isNewRecord())
        return null

      throw new Error(`${args.reflectionName} hasnt been loaded yet`)
    }

    return this.relationshipsCache[args.reflectionName]
  }

  _readModelDataFromArgs(args) {
    this.modelData = args.data.attributes
    this.includedRelationships = args.data.relationships
  }

  _readIncludedRelationships(included) {
    if (!this.includedRelationships)
      return

    for(var relationshipName in this.includedRelationships) {
      var relationshipData = this.includedRelationships[relationshipName]
      var relationshipClassData = this.modelClassData().relationships.find(relationship => relationship.name == relationshipName)
      var relationshipType = relationshipClassData.collectionName

      if (!relationshipData) {
        this.relationshipsCache[relationshipName] = null
      } else if (Array.isArray(relationshipData)) {
        var result = []

        for(var relationshipId of relationshipData) {
          var model = included.getModel(relationshipType, relationshipId)
          result.push(model)
        }

        this.relationshipsCache[relationshipName] = result
      } else {
        var model = included.getModel(relationshipType, relationshipData)
        this.relationshipsCache[relationshipName] = model
      }
    }
  }

  _primaryKey() {
    return this._getAttribute(this.modelClassData().primaryKey)
  }

  static _token() {
    var csrfTokenElement = document.querySelector("meta[name='csrf-token']")
    if (csrfTokenElement)
      return csrfTokenElement.getAttribute("content")
  }
}
