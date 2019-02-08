import Api from "./api"
import CableConnectionPool from "./cable-connection-pool"
import Collection from "./collection"
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
      let urlToUse = `${this.modelClassData().path}/${id}`

      Api.get(urlToUse).then((response) => {
        let modelClass = require(`api-maker/models/${inflection.dasherize(this.modelClassData().paramKey)}`).default
        let model = new modelClass({data: response.model})
        resolve(model)
      }, (error) => {
        reject(error)
      })
    })
  }

  static modelName() {
    return new ModelName({modelClassData: this.modelClassData()})
  }

  static ransack(query = {}) {
    return new Collection({"ransack": query, "modelClass": this})
  }

  constructor(args = {}) {
    this.changes = {}
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
    let cableSubscription = CableConnectionPool.current().connectEvent(this.modelClassData().name, this._primaryKey(), eventName, callback)
    return cableSubscription
  }

  connectUpdated(callback) {
    let cableSubscription = CableConnectionPool.current().connectUpdate(this.modelClassData().name, this._primaryKey(), callback)
    return cableSubscription
  }

  assignAttributes(newAttributes) {
    for(let key in newAttributes) {
      let oldValue = this._getAttribute(key)
      let originalValue = this.modelData[key]
      let newValue = newAttributes[key]

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
      let keyParts = [
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
      let paramKey = this.modelClassData().paramKey
      let urlToUse = this.modelClassData().path
      let modelData = this.getAttributes()
      let dataToUse = {}
      dataToUse[paramKey] = modelData

      Api.post(urlToUse, dataToUse).then((response) => {
        if (response.success) {
          if (response.model) {
            this.modelData = response.model.attributes
            this.changes = {}
          }

          resolve({"model": this, "response": response})
        } else {
          reject({"model": this, "response": response})
        }
      }, (response) => {
        reject({"model": this, "response": response})
      })
    })
  }

  createRaw(data) {
    return new Promise((resolve, reject) => {
      let paramKey = this.modelClassData().paramKey
      let urlToUse = this.modelClassData().path

      Api.requestLocal({path: urlToUse, method: "POST", rawData: data}).then((response) => {
        if (response.success) {
          if (response.model) {
            this.modelData = response.model.attributes
            this.changes = {}
          }

          resolve({"model": this, "response": response})
        } else {
          reject({"model": this, "response": response})
        }
      }, (response) => {
        reject({"model": this, "response": response})
      })
    })
  }

  destroy() {
    return new Promise((resolve, reject) => {
      let urlToUse = `${this.modelClassData().path}/${this._primaryKey()}`

      Api.delete(urlToUse).then((response) => {
        if (response.success) {
          if (response.model) {
            this.modelData = response.model.attributes
            this.changes = {}
          }

          resolve(response)
        } else {
          reject(response)
        }
      }, (response) => {
        reject({"model": this, "response": response})
      })
    })
  }

  getAttributes() {
    return Object.assign(this.modelData, this.changes)
  }

  static humanAttributeName(attributeName) {
    let keyName = this.modelClassData().i18nKey
    return I18n.t(`activerecord.attributes.${keyName}.${BaseModel.snakeCase(attributeName)}`)
  }

  static snakeCase(string) {
    return inflection.underscore(string)
  }

  isChanged() {
    let keys = Object.keys(this.changes)

    if (keys.length > 0) {
      return true
    } else {
      return false
    }
  }

  isNewRecord() {
    if ("id" in this.modelData && this.modelData.id) {
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
    return new Promise((resolve, reject) => {
      let urlToUse = `${this.modelClassData().path}/${this._primaryKey()}`

      Api.get(urlToUse).then((response) => {
        if (response.model) {
          this.modelData = response.model.attributes
          this.changes = {}
        }

        resolve(response)
      }, (response) => {
        reject({"model": this, "response": response})
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

      let paramKey = this.modelClassData().paramKey
      let urlToUse = `${this.modelClassData().path}/${this._primaryKey()}`
      let dataToUse = {}
      dataToUse[paramKey] = this.changes

      if (Object.keys(dataToUse[paramKey]).length == 0)
        return resolve(resolve({"model": this}))

      Api.patch(urlToUse, dataToUse).then((response) => {
        if (response.success) {
          if (response.model) {
            this.modelData = response.model.attributes
            this.changes = {}
          }

          resolve({"model": this, "response": response})
        } else {
          reject({"model": this, "response": response})
        }
      }, (response) => {
        reject({"model": this, "response": response})
      })
    })
  }

  updateRaw(data) {
    return new Promise((resolve, reject) => {
      let paramKey = this.modelClassData().paramKey
      let urlToUse = `${this.modelClassData().path}/${this._primaryKey()}`

      Api.requestLocal({path: urlToUse, method: "PATCH", rawData: data}).then((response) => {
        if (response.success) {
          if (response.model) {
            this.modelData = response.model.attributes
            this.changes = {}
          }

          resolve({"model": this, "response": response})
        } else {
          reject({"model": this, "response": response})
        }
      }, (response) => {
        reject({"model": this, "response": response})
      })
    })
  }

  isValid() {
    throw new Error("Not implemented yet")
  }

  isValidOnServer() {
    return new Promise((resolve, reject) => {
      let paramKey = this.modelClassData().paramKey
      let urlToUse = `${this.modelClassData().path}/validate`
      let modelData = this.getAttributes()
      let dataToUse = {}
      dataToUse[paramKey] = modelData

      Api.post(urlToUse, dataToUse).then((response) => {
        resolve({"valid": response.valid, "errors": response.errors})
      }, (response) => {
        reject({"model": this, "response": response})
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
      let min = 500000000000000000
      let max = 999999999999999999
      let randomBetween = Math.floor(Math.random() * (max - min + 1) + min)
      this.uniqueKeyValue = randomBetween
    }

    return this.uniqueKeyValue
  }

  static _callCollectionCommand(args) {
    return new Promise((resolve, reject) => {
      let url = `/api_maker/${args.modelClass.modelClassData().pluralName}/${args.collectionCommand}`
      let postData = BaseModel._postDataFromArgs(args.args)

      postData.append("plural_name", args.modelClass.modelClassData().pluralName)
      postData.append("collection_command", args.collectionCommand)

      Api.requestLocal({path: url, method: "POST", rawData: postData}).then((response) => {
        resolve(response)
      }, (response) => {
        reject(response)
      })
    })
  }

  _callMemberCommand(args) {
    return new Promise((resolve, reject) => {
      let url = `/api_maker/${args.model.modelClassData().pluralName}/${args.model._primaryKey()}/${args.memberCommand}`
      let postData = BaseModel._postDataFromArgs(args.args)

      postData.append("plural_name", this.modelClassData().pluralName)
      postData.append("member_command", args.memberCommand)

      Api.requestLocal({path: url, method: "POST", rawData: postData}).then((response) => {
        resolve(response)
      }, (response) => {
        reject(response)
      })
    })
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
      let attributes = this.modelClassData().attributes
      for(let key in attributes) {
        let attribute = attributes[key]

        if (attribute.name == attributeName)
          return null
      }
    }

    throw new Error(`No such attribute: ${attributeName}`)
  }

  _getAttributeDateTime(attributeName) {
    let value = this._getAttribute(attributeName)

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
    let value = this._getAttribute(attributeName)

    if (!value)
      return null

    let cents = value.amount
    let currency = value.currency
    return Money.fromInteger(cents, currency)
  }

  _loadBelongsToReflection(args) {
    return new Promise((resolve, reject) => {
      if (args.reflectionName in this.relationshipsCache) {
        resolve(this.relationshipsCache[args.reflectionName])
      } else {
        let collection = new Collection(args)
        collection.first().then((model) => {
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

  _loadHasOneReflection(args) {
    return new Promise((resolve, reject) => {
      if (args.reflectionName in this.relationshipsCache) {
        resolve(this.relationshipsCache[args.reflectionName])
      } else {
        let collection = new Collection(args)
        collection.first().then((model) => {
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

    if (!args.data.relationships)
      return

    for(let relationshipName in args.data.relationships) {
      let relationshipData = args.data.relationships[relationshipName]

      if (!relationshipData) {
        this.relationshipsCache[relationshipName] = null
      } else if (Array.isArray(relationshipData.data)) {
        let result = []

        for(let relationshipDataIKey in relationshipData.data) {
          let relationshipDataI = relationshipData.data[relationshipDataIKey]

          let includedData = args.response.included.find((included) => {
            return included.type == relationshipDataI.type && included.id == relationshipDataI.id
          })

          if (!includedData)
            throw new Error(`Couldn't find included data for ${relationshipName}`)

          let modelClassName = inflection.dasherize(inflection.singularize(includedData.type))
          let modelClass = require(`api-maker/models/${modelClassName}`).default
          let model = new modelClass({data: includedData, response: args.response})

          result.push(model)
        }

        this.relationshipsCache[relationshipName] = result
      } else {
        let includedData = args.response.included.find((included) => {
          return included.type == relationshipData.data.type && included.id == relationshipData.data.id
        })

        if (!includedData)
          throw new Error(`Couldn't find included data for ${relationshipName}`)

        let modelClassName = inflection.dasherize(inflection.singularize(includedData.type))
        let modelClass = require(`api-maker/models/${modelClassName}`).default
        let model = new modelClass({data: includedData, response: args.response})

        this.relationshipsCache[relationshipName] = model
      }
    }
  }

  _primaryKey() {
    return this._getAttribute(this.modelClassData().primaryKey)
  }

  static _token() {
    let csrfTokenElement = document.querySelector("meta[name='csrf-token']")
    if (csrfTokenElement)
      return csrfTokenElement.getAttribute("content")
  }
}
