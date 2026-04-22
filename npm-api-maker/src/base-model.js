// @ts-check
import * as inflection from "inflection"
import {ValidationErrors} from "./validation-errors.js"
import {digg} from "diggerize"
import Attribute from "./base-model/attribute.js" // eslint-disable-line sort-imports
import AttributeNotLoadedError from "./attribute-not-loaded-error.js"
import CacheKeyGenerator from "./cache-key-generator.js"
import Collection from "./collection.js"
import CommandsPool from "./commands-pool.js"
import Config from "./config.js"
import CustomError from "./custom-error.js"
import FormDataObjectizer from "form-data-objectizer"
import ModelName from "./model-name.js"
import NotLoadedError from "./not-loaded-error.js"
import Reflection from "./base-model/reflection.js"
import Scope from "./base-model/scope.js"
import Services from "./services.js"
import ValidationError from "./validation-error.js"
import objectToFormData from "object-to-formdata"

/** @typedef {string | number} ModelIdentifier */
/** @typedef {string | number | boolean | null | undefined | Date | File | Blob} ModelScalarValue */
/** @typedef {{[key: string]: ModelValue}} ModelValueMap */
/** @typedef {Array<ModelValue>} ModelValueArray */
/** @typedef {ModelScalarValue | ModelValueMap | ModelValueArray} ModelValue */
/** @typedef {Record<string, ModelValue>} ModelDataMap */
/** @typedef {Record<string, boolean>} ModelAbilityMap */
/** @typedef {ModelIdentifier | ModelIdentifier[] | null} PreloadedRelationshipValue */
/** @typedef {Record<string, PreloadedRelationshipValue>} PreloadedRelationshipMap */
/** @typedef {BaseModel | BaseModel[] | null} LoadedRelationshipValue */
/** @typedef {Record<string, LoadedRelationshipValue>} LoadedRelationshipMap */
/** @typedef {import("./base-model/reflection.js").ReflectionMacro} ReflectionMacro */
/** @typedef {FormData | HTMLFormElement | ModelDataMap} RawDataInput */
/** @typedef {Record<string, string | string[] | undefined>} ValidationResponseErrors */
/**
 * @typedef {object} RelationshipDataType
 * @property {string} collectionName
 * @property {string} [foreignKey]
 * @property {ReflectionMacro} macro
 * @property {string} name
 * @property {string} resource_name
 * @property {string} [through]
 */
/**
 * @typedef {object} ScopeDataType
 * @property {string} name
 */
/**
 * @typedef {object} ModelClassDataType
 * @property {Record<string, import("./base-model/attribute.js").AttributeArgType>} attributes
 * @property {string} camelizedLower
 * @property {string} className
 * @property {string} collectionKey
 * @property {string} collectionName
 * @property {string} i18nKey
 * @property {string} name
 * @property {string} nameDasherized
 * @property {string} paramKey
 * @property {string} pluralName
 * @property {string} primaryKey
 * @property {RelationshipDataType[]} ransackable_associations
 * @property {import("./base-model/attribute.js").AttributeArgType[]} ransackable_attributes
 * @property {ScopeDataType[]} ransackable_scopes
 * @property {RelationshipDataType[]} relationships
*/

/**
 * @typedef {object} ParseValidationErrorsOptions
 * @property {HTMLFormElement} [form]
 * @property {boolean} [throwValidationError]
 */
/**
 * @typedef {object} LoadedModelDataType
 * @property {ModelDataMap} [a]
 * @property {ModelAbilityMap} [b]
 * @property {PreloadedRelationshipMap} [r]
 */
/**
 * @typedef {object} BaseModelArgsObject
 * @property {ModelDataMap} [a]
 * @property {ModelAbilityMap} [b]
 * @property {import("./collection.js").default} [collection]
 * @property {LoadedModelDataType} [data]
 * @property {boolean} [isNewRecord]
 */
/** @typedef {BaseModelArgsObject | ModelDataMap} BaseModelArgs */
/**
 * @typedef {object} BaseModelStaticMethods
 * @property {string} apiMakerType
 * @property {() => import("./collection.js").default} all
 * @property {() => Attribute[]} attributes
 * @property {(id: ModelIdentifier) => Promise<BaseModel>} find
 * @property {(findOrCreateByArgs: ModelDataMap, args?: {additionalData?: ModelDataMap}) => Promise<BaseModel>} findOrCreateBy
 * @property {(args: ModelDataMap) => import("./command-execution.js").default} [createLink]
 * @property {(args: ModelDataMap) => import("./command-execution.js").default} [destroyLinks]
 * @property {(attributeName: string) => boolean} hasAttribute
 * @property {(attributeName: string) => string} humanAttributeName
 * @property {(args: ModelDataMap) => Promise<{link?: BaseModel | null}>} [linkFor]
 * @property {() => ModelClassDataType} modelClassData
 * @property {() => ModelName} modelName
 * @property {() => string} primaryKey
 * @property {() => Promise<{current?: BaseModel[]}>} [current]
 * @property {(query?: import("./collection.js").CollectionRansackParams) => import("./collection.js").default} ransack
 * @property {() => {name?: string}} [resourceData]
 * @property {() => Reflection[]} reflections
 * @property {(name: string) => Reflection} reflection
 * @property {() => Reflection[]} ransackableAssociations
 * @property {() => Attribute[]} ransackableAttributes
 * @property {() => Scope[]} ransackableScopes
 * @property {(select?: Record<string, string[]>) => import("./collection.js").default} select
 * @property {(attributeName: string) => string} snakeCase
 */
/** @typedef {typeof import("./base-model.js").default & BaseModelStaticMethods} BaseModelClassType */
/**
 * @typedef {object} ModelCommandDescriptor
 * @property {ModelDataMap | FormData | HTMLFormElement} [args]
 * @property {string} collectionName
 * @property {string} command
 * @property {ModelIdentifier} [primaryKey]
 * @property {string} type
 */
/**
 * @typedef {object} ModelCommandOptions
 * @property {boolean} [cacheResponse]
 * @property {boolean} [forceHttp]
 * @property {HTMLFormElement} [form]
 * @property {boolean} [instant]
 */
/**
 * @typedef {object} ModelCommandResponse
 * @property {ValidationResponseErrors} [errors]
 * @property {BaseModel | BaseModel[]} [model]
 * @property {boolean} [success]
 * @property {boolean} [valid]
 */
/**
 * @typedef {object} ValidationErrorWithResponse
 * @property {{response?: {validation_errors?: import("./validation-errors.js").ValidationErrorEntryArgs[]}}} [args]
 */
/**
 * @typedef {object} RelationshipLoadArgs
 * @property {BaseModel} [model]
 * @property {typeof import("./base-model.js").default} [modelClass]
 * @property {string} reflectionName
 */

/**
 * @param {ModelDataMap} object
 * @returns {ModelDataMap}
 */
const objectToUnderscore = (object) => {
  const newObject = /** @type {ModelDataMap} */ ({})

  for (const key in object) {
    const underscoreKey = inflection.underscore(key)

    newObject[underscoreKey] = object[key]
  }

  return newObject
}

/** BaseModel. */
const BaseModel = class BaseModel {
  static apiMakerType = "BaseModel"

  /** @returns {Attribute[]} */
  static attributes() {
    const attributes = this.modelClassData().attributes
    const result = []

    for (const attributeKey in attributes) {
      const attributeData = attributes[attributeKey]
      const attribute = new Attribute(attributeData)

      result.push(attribute)
    }

    return result
  }

  /**
   * @param {string} attributeName
   * @returns {boolean}
   */
  static hasAttribute(attributeName) {
    const attributes = digg(this.modelClassData(), "attributes")
    const lowerCaseAttributeName = inflection.underscore(attributeName)

    if (lowerCaseAttributeName in attributes) return true

    return false
  }

  /**
   * @interface
   * @returns {ModelClassDataType}
   */
  static modelClassData() {
    throw new Error("modelClassData should be overriden by child")
  }

  /**
   * @param {ValidationErrors} validationErrors
   * @returns {CustomEvent}
   */
  static newCustomEvent(validationErrors) {
    return new CustomEvent("validation-errors", {detail: validationErrors})
  }

  /**
   * @param {ValidationErrors} validationErrors
   * @param {object} [options]
   * @param {object} [options.form]
   * @param {boolean} [options.throwValidationError]
   */
  static sendValidationErrorsEvent(validationErrors, options) {
    if (options && options.form) {
      const event = BaseModel.newCustomEvent(validationErrors)
      options.form.dispatchEvent(event)
    }
  }

  /**
   * @param {number | string} id
   * @returns {Promise<BaseModel>}
   */
  static async find(id) {
    const query = /** @type {import("./collection.js").CollectionRansackParams} */ ({})

    query[`${this.primaryKey()}_eq`] = id

    const model = await this.ransack(query).first()

    if (model) {
      return model
    } else {
      throw new CustomError("Record not found")
    }
  }

  /**
   * @param {ModelDataMap} findOrCreateByArgs
   * @param {object} [args]
   * @param {ModelDataMap} [args.additionalData]
   * @returns {Promise<BaseModel>}
   */
  static async findOrCreateBy(findOrCreateByArgs, args = {}) {
    const result = await Services.current().sendRequest("Models::FindOrCreateBy", {
      additional_data: args.additionalData,
      find_or_create_by_args: findOrCreateByArgs,
      resource_name: digg(this.modelClassData(), "name")
    })
    const model = digg(result, "model")

    return model
  }

  /** @returns {ModelName} */
  static modelName() {
    return new ModelName({modelClassData: this.modelClassData()})
  }

  /** @returns {string} */
  static primaryKey() {
    return digg(this.modelClassData(), "primaryKey")
  }

  /**
   * @param {import("./collection.js").CollectionRansackParams} [query]
   * @returns {import("./collection.js").default}
   */
  static ransack(query = {}) {
    return new Collection({modelClass: this}, {ransack: query})
  }

  /**
   * @param {Record<string, string[]>} [select]
   * @returns {import("./collection.js").default}
   */
  static select(select) {
    return this.ransack().select(select)
  }

  /** @returns {Reflection[]} */
  static ransackableAssociations() {
    const relationships = digg(this.modelClassData(), "ransackable_associations")
    const reflections = []

    for (const relationshipData of relationships) {
      reflections.push(new Reflection(relationshipData))
    }

    return reflections
  }

  /** @returns {Attribute[]} */
  static ransackableAttributes() {
    const attributes = this.modelClassData().ransackable_attributes
    const result = []

    for (const attributeData of attributes) {
      result.push(new Attribute(attributeData))
    }

    return result
  }

  /** @returns {Scope[]} */
  static ransackableScopes() {
    const ransackableScopes = digg(this.modelClassData(), "ransackable_scopes")
    const result = []

    for (const scopeData of ransackableScopes) {
      const scope = new Scope(scopeData)

      result.push(scope)
    }

    return result
  }

  /** @returns {Reflection[]} */
  static reflections() {
    const relationships = digg(this.modelClassData(), "relationships")
    const reflections = []

    for (const relationshipData of relationships) {
      const reflection = new Reflection(relationshipData)

      reflections.push(reflection)
    }

    return reflections
  }

  /**
   * @param {string} name
   * @returns {Reflection}
   */
  static reflection(name) {
    const foundReflection = this.reflections().find((reflection) => reflection.name() == name)

    if (!foundReflection) {
      const reflectionNames = this.reflections()
        .map((reflection) => reflection.name())
        .join(", ")

      throw new Error(`No such reflection: ${name} in ${reflectionNames}`)
    }

    return foundReflection
  }

  /** @returns {string | undefined} */
  static _token() {
    const csrfTokenElement = document.querySelector("meta[name='csrf-token']")

    if (csrfTokenElement) {
      return csrfTokenElement.getAttribute("content")
    }

    return undefined
  }

  /** @param {BaseModelArgs} [args] */
  constructor(args = {}) {
    const argsObject = /** @type {BaseModelArgsObject} */ (args)

    this.abilities = /** @type {ModelAbilityMap} */ ({})
    this.changes = /** @type {ModelDataMap} */ ({})
    this.collection = undefined
    this._identifierKey = undefined
    this._markedForDestruction = undefined
    this.modelData = /** @type {ModelDataMap} */ ({})
    this.newRecord = argsObject.isNewRecord
    this.previousModelData = undefined
    this.preloadedRelationships = undefined
    this.relationshipsCache = /** @type {LoadedRelationshipMap} */ ({})
    this.relationships = /** @type {LoadedRelationshipMap} */ ({})
    this.uniqueKeyValue = undefined

    if (argsObject && argsObject.data && argsObject.data.a) {
      this._readModelDataFromArgs(argsObject)
    } else if (argsObject.a) {
      this.abilities = argsObject.b || {}
      this.modelData = objectToUnderscore(argsObject.a)
    } else if (args) {
      this.abilities = {}
      this.modelData = objectToUnderscore(/** @type {ModelDataMap} */ (args))
    } else {
      this.abilities = {}
      this.modelData = /** @type {ModelDataMap} */ ({})
    }
  }

  /**
   * @param {ModelDataMap} newAttributes
   * @returns {void}
   */
  assignAttributes(newAttributes) {
    for (const key in newAttributes) {
      const newValue = newAttributes[key]
      const attributeUnderscore = inflection.underscore(key)

      let applyChange = true
      let deleteChange = false

      if (this.isAttributeLoaded(key)) {
        const oldValue = this.readAttribute(key)
        const originalValue = this.modelData[attributeUnderscore]

        if (newValue == oldValue) {
          applyChange = false
        } else if (newValue == originalValue) {
          applyChange = false
          deleteChange = true
        }
      }

      if (applyChange) {
        this.changes[attributeUnderscore] = newValue
      } else if (deleteChange) {
        delete this.changes[attributeUnderscore]
      }
    }
  }

  /** @returns {ModelDataMap} */
  attributes() {
    const result = /** @type {ModelDataMap} */ ({})

    for (const key in this.modelData) {
      result[key] = this.modelData[key]
    }

    for (const key in this.changes) {
      result[key] = this.changes[key]
    }

    return result
  }

  /**
   * @param {string} givenAbilityName
   * @returns {boolean}
   */
  can(givenAbilityName) {
    const abilityName = inflection.underscore(givenAbilityName)

    if (!(abilityName in this.abilities)) {
      throw new Error(`Ability ${abilityName} hasn't been loaded for ${digg(this.modelClassData(), "name")}`)
    }

    return this.abilities[abilityName]
  }

  /** @returns {BaseModel} */
  clone() {
    const ModelClass = this.modelClass()
    const clone = new ModelClass()

    clone.abilities = {...this.abilities}
    clone.modelData = {...this.modelData}
    clone.relationships = {...this.relationships}
    clone.relationshipsCache = {...this.relationshipsCache}

    return clone
  }

  /** @returns {number | string} */
  cacheKey() {
    if (this.isPersisted()) {
      const keyParts = [
        this.modelClassData().paramKey,
        this.primaryKey()
      ]

      if ("updated_at" in this.modelData) {
        // @ts-expect-error
        const updatedAt = this.updatedAt()

        if (typeof updatedAt != "object") {
          throw new Error(`updatedAt wasn't an object: ${typeof updatedAt}`)
        } else if (!("getTime" in updatedAt)) {
          throw new Error(`updatedAt didn't support getTime with class: ${updatedAt.constructor && updatedAt.constructor.name}`)
        }

        // @ts-expect-error
        keyParts.push(`updatedAt-${this.updatedAt().getTime()}`)
      }

      return keyParts.join("-")
    } else {
      return this.uniqueKey()
    }
  }

  /** @returns {string} */
  localCacheKey() {
    const cacheKeyGenerator = new CacheKeyGenerator(this)

    return cacheKeyGenerator.local()
  }

  /** @returns {string} */
  fullCacheKey() {
    const cacheKeyGenerator = new CacheKeyGenerator(this)

    return cacheKeyGenerator.cacheKey()
  }

  /** @returns {import("./collection.js").default} */
  static all() {
    return this.ransack()
  }

  /**
   * @param {ModelDataMap} [attributes]
   * @param {ParseValidationErrorsOptions} [options]
   * @returns {Promise<{
   *   model: BaseModel,
   *   response: ModelCommandResponse
   * }>}
   */
  async create(attributes, options) {
    if (attributes) this.assignAttributes(attributes)
    const paramKey = this.modelClassData().paramKey
    const modelData = this.getAttributes()
    const dataToUse = {}
    dataToUse[paramKey] = modelData
    let response

    try {
      response = /** @type {ModelCommandResponse} */ (await CommandsPool.addCommand(
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
      ))
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

  /**
   * @param {RawDataInput} rawData
   * @param {ParseValidationErrorsOptions} [options]
   * @returns {Promise<{model: BaseModel, response: ModelCommandResponse}>}
   */
  async createRaw(rawData, options = {}) {
    const objectData = BaseModel._objectDataFromGivenRawData(rawData, options)

    /** @type {ModelCommandResponse} */
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

  /** @returns {Promise<{model: BaseModel, response: ModelCommandResponse}>} */
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
      this.handleResponseError(response)
    }
  }

  /**
   * @param {string[]} listOfAbilities
   * @returns {Promise<void>}
   */
  async ensureAbilities(listOfAbilities) {
    const abilitiesToLoad = []

    for (const abilityInList of listOfAbilities) {
      if (!(abilityInList in this.abilities)) {
        abilitiesToLoad.push(abilityInList)
      }
    }

    if (abilitiesToLoad.length > 0) {
      const primaryKeyName = this.modelClass().primaryKey()
      const ransackParams = /** @type {import("./collection.js").CollectionRansackParams} */ ({})
      ransackParams[`${primaryKeyName}_eq`] = this.primaryKey()

      const abilitiesParams = /** @type {Record<string, string[]>} */ ({})
      abilitiesParams[digg(this.modelClassData(), "name")] = abilitiesToLoad

      const anotherModel = await this.modelClass()
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

  /** @returns {ModelDataMap} */
  getAttributes() {
    return Object.assign(this.modelData, this.changes)
  }

  /**
   * @param {ModelCommandResponse} response
   * @returns {never}
   */
  handleResponseError(response) {
    throw new CustomError(
      "Response wasn't successful",
      {
        model: this,
        response: /** @type {object} */ (response)
      }
    )
  }

  /** @returns {number | string} */
  identifierKey() {
    if (!this._identifierKey) this._identifierKey = this.isPersisted() ? this.primaryKey() : this.uniqueKey()

    return this._identifierKey
  }

  /**
   * @param {string} associationName
   * @returns {boolean}
   */
  isAssociationLoaded(associationName) { return this.isAssociationLoadedUnderscore(inflection.underscore(associationName)) }

  /**
   * @param {string} associationNameUnderscore
   * @returns {boolean}
   */
  isAssociationLoadedUnderscore (associationNameUnderscore) {
    if (associationNameUnderscore in this.relationshipsCache) return true
    return false
  }

  /**
   * @param {string} associationName
   * @returns {boolean}
   */
  isAssociationPresent(associationName) {
    if (this.isAssociationLoaded(associationName)) return true
    if (associationName in this.relationships) return true
    return false
  }

  /**
   * @param {string} associationName
   * @returns {Promise<LoadedRelationshipValue>}
   */
  async ensureAssociationLoaded(associationName) {
    return this.ensureAssociationLoadedUnderscore(inflection.underscore(associationName))
  }

  /**
   * @param {string} associationNameUnderscore
   * @returns {Promise<LoadedRelationshipValue>}
   */
  async ensureAssociationLoadedUnderscore(associationNameUnderscore) {
    const reflection = this.modelClassData().relationships.find((relationship) => relationship.name == associationNameUnderscore)

    if (!reflection) {
      const relationshipNames = this.modelClassData().relationships.map((relationship) => relationship.name)

      throw new Error(`Could not find the relation ${associationNameUnderscore} on ${this.modelClassData().name}: ${relationshipNames.join(", ")}`)
    }

    const methodName = inflection.camelize(associationNameUnderscore, true)
    const loadMethodName = inflection.camelize(`load_${associationNameUnderscore}`, true)

    if (!(methodName in this)) throw new Error(`No such association method on ${this.modelClassData().name}: ${methodName}`)
    if (!(loadMethodName in this)) throw new Error(`No such association load method on ${this.modelClassData().name}: ${loadMethodName}`)

    if (this.isAssociationLoadedUnderscore(associationNameUnderscore)) {
      const loadedAssociation = /** @type {LoadedRelationshipValue | {loaded(): BaseModel[]}} */ (this[methodName]())

      if (reflection.macro == "has_many") {
        return /** @type {{loaded(): BaseModel[]}} */ (loadedAssociation).loaded()
      }

      return /** @type {LoadedRelationshipValue} */ (loadedAssociation)
    }

    return this[loadMethodName]()
  }

  /**
   * @param {object} args
   * @param {ValidationError | Error | ValidationErrorWithResponse} args.error
   * @param {BaseModel} [args.model]
   * @param {ParseValidationErrorsOptions} [args.options]
   */
  static parseValidationErrors({error, model, options}) {
    if (!(error instanceof ValidationError)) return
    if (!error.args?.response?.validation_errors) return

    const validationErrors = new ValidationErrors({
      model,
      validationErrors: /** @type {import("./validation-errors.js").ValidationErrorEntryArgs[]} */ (digg(error, "args", "response", "validation_errors"))
    })

    BaseModel.sendValidationErrorsEvent(validationErrors, options)

    if (!options || options.throwValidationError != false) {
      throw error
    }
  }

  /**
   * @param {string} attributeName
   * @returns {string}
   */
  static humanAttributeName(attributeName) {
    const keyName = digg(this.modelClassData(), "i18nKey")

    // @ts-expect-error
    const i18n = Config.getI18n()

    if (i18n) return i18n.t(`activerecord.attributes.${keyName}.${BaseModel.snakeCase(attributeName)}`, {defaultValue: attributeName})

    return inflection.humanize(attributeName)
  }

  /**
   * @param {string} attributeName
   * @returns {boolean}
   */
  isAttributeChanged(attributeName) {
    const attributeNameUnderscore = inflection.underscore(attributeName)
    const attributes = Object.values(this.modelClassData().attributes)
    const attributeData = attributes.find((attribute) => digg(attribute, "name") == attributeNameUnderscore)

    if (!attributeData) {
      const attributeNames = attributes.map((attribute) => digg(attribute, "name"))

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

  /** @returns {boolean} */
  isChanged() {
    const keys = Object.keys(this.changes)

    if (keys.length > 0) {
      return true
    } else {
      return false
    }
  }

  /** @returns {boolean} */
  isNewRecord() {
    if (this.newRecord !== undefined) {
      return this.newRecord
    } else if ("id" in this.modelData && this.modelData.id) {
      return false
    } else {
      return true
    }
  }

  /** @returns {boolean} */
  isPersisted() { return !this.isNewRecord() }

  /**
   * @param {string} string
   * @returns {string}
   */
  static snakeCase(string) { return inflection.underscore(string) }

  /**
   * @param {string} attributeName
   * @returns {boolean}
   */
  savedChangeToAttribute(attributeName) {
    if (!this.previousModelData)
      return false

    const attributeNameUnderscore = inflection.underscore(attributeName)
    const attributes = Object.values(this.modelClassData().attributes)
    const attributeData = attributes.find((attribute) => attribute.name == attributeNameUnderscore)

    if (!attributeData) {
      const attributeNames = attributes.map((attribute) => attribute.name)
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

  /**
   * @param {BaseModel} model
   * @returns {void}
   */
  setNewModel(model) {
    this.setNewModelData(model)

    for(const relationshipName in model.relationships) {
      this.relationships[relationshipName] = model.relationships[relationshipName]
    }

    for(const relationshipCacheName in model.relationshipsCache) {
      this.relationshipsCache[relationshipCacheName] = model.relationshipsCache[relationshipCacheName]
    }
  }

  /**
   * @param {BaseModel} model
   * @returns {void}
   */
  setNewModelData(model) {
    if (!("modelData" in model)) throw new Error(`No modelData in model: ${JSON.stringify(model)}`)

    this.previousModelData = {...digg(this, "modelData")}

    for(const attributeName in model.modelData) {
      this.modelData[attributeName] = model.modelData[attributeName]
    }
  }

  /**
   * @param {ModelValue | null | undefined} oldValue
   * @param {ModelValue | null | undefined} newValue
   * @returns {boolean | void}
   */
  _isDateChanged(oldValue, newValue) {
    if (Date.parse(String(oldValue)) != Date.parse(String(newValue)))
      return true
  }

  /**
   * @param {ModelValue | null | undefined} oldValue
   * @param {ModelValue | null | undefined} newValue
   * @returns {boolean | void}
   */
  _isIntegerChanged(oldValue, newValue) {
    if (parseInt(String(oldValue), 10) != parseInt(String(newValue), 10))
      return true
  }

  /**
   * @param {ModelValue | null | undefined} oldValue
   * @param {ModelValue | null | undefined} newValue
   * @returns {boolean | void}
   */
  _isStringChanged (oldValue, newValue) {
    const oldConvertedValue = `${oldValue}`
    const newConvertedValue = `${newValue}`

    if (oldConvertedValue != newConvertedValue)
      return true
  }

  /** @returns {ModelClassDataType} */
  modelClassData() { return this.modelClass().modelClassData() }

  /** @returns {Promise<void>} */
  async reload() {
    const params = this.collection && this.collection.params()
    const ransackParams = /** @type {import("./collection.js").CollectionRansackParams} */ ({})
    ransackParams[`${this.modelClass().primaryKey()}_eq`] = this.primaryKey()

    let query = this.modelClass().ransack(ransackParams)

    if (params) {
      if (params.preload) {
        query.queryArgs.preload = /** @type {import("./collection.js").PreloadValue} */ (params.preload)
      }

      if (params.select) {
        query.queryArgs.select = /** @type {Record<string, string[]>} */ (params.select)
      }

      if (params.select_columns) {
        query.queryArgs.selectColumns = /** @type {Record<string, string[]>} */ (params.select_columns)
      }
    }

    const model = await query.first()
    this.setNewModel(model)
    this.changes = {}
  }

  /** @returns {Promise<{model: BaseModel, response?: object}>} */
  save() {
    if (this.isNewRecord()) {
      return this.create()
    } else {
      return this.update()
    }
  }

  /**
   * @param {RawDataInput} rawData
   * @param {ParseValidationErrorsOptions & {simpleModelErrors?: boolean}} [options]
   * @returns {Promise<{model: BaseModel, response: ModelCommandResponse}>}
   */
  saveRaw(rawData, options = {}) {
    if (this.isNewRecord()) {
      return this.createRaw(rawData, options)
    } else {
      return this.updateRaw(rawData, options)
    }
  }

  /**
   * @param {ModelDataMap} [newAttributes]
   * @param {ParseValidationErrorsOptions} [options]
   * @returns {Promise<{
   *   model: BaseModel,
   *   response?: object
   * }>}
   */
  async update(newAttributes, options) {
    if (newAttributes) {
      this.assignAttributes(newAttributes)
    }

    if (Object.keys(this.changes).length == 0) {
      return {model: this}
    }

    const paramKey = this.modelClassData().paramKey
    const modelData = this.changes
    const dataToUse = {}
    dataToUse[paramKey] = modelData
    let response

    try {
      response = /** @type {ModelCommandResponse} */ (await CommandsPool.addCommand(
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
      ))
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

  /**
   * @param {ModelCommandResponse} response
   * @returns {void}
   */
  _refreshModelFromResponse(response) {
    let newModel = digg(response, "model")

    if (Array.isArray(newModel)) newModel = newModel[0]

    this.setNewModel(newModel)
  }

  /**
   * @param {ModelCommandResponse} response
   * @returns {void}
   */
  _refreshModelDataFromResponse(response) {
    let newModel = digg(response, "model")

    if (Array.isArray(newModel)) newModel = newModel[0]

    this.setNewModelData(newModel)
  }

  /**
   * @param {RawDataInput} rawData
   * @param {object} options
   * @returns {ModelDataMap}
   */
  static _objectDataFromGivenRawData(rawData, options) {
    if (rawData instanceof FormData || BaseModel._isFormElement(rawData)) {
      const formData = FormDataObjectizer.formDataFromObject(rawData, options)

      return /** @type {ModelDataMap} */ (FormDataObjectizer.toObject(formData))
    }

    return rawData
  }

  /**
   * @param {RawDataInput | ModelValue} value
   * @returns {value is HTMLFormElement}
   */
  static _isFormElement(value) {
    return typeof HTMLFormElement != "undefined" && value instanceof HTMLFormElement
  }

  /**
   * @param {RawDataInput} rawData
   * @param {ParseValidationErrorsOptions & {simpleModelErrors?: boolean}} [options]
   * @returns {Promise<{response: ModelCommandResponse, model: BaseModel}>}
   */
  async updateRaw(rawData, options = {}) {
    const objectData = BaseModel._objectDataFromGivenRawData(rawData, options)
    let response

    try {
      response = /** @type {ModelCommandResponse} */ (await CommandsPool.addCommand(
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
      ))
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

  /** @returns {never} */
  isValid() {
    throw new Error("Not implemented yet")
  }

  /** @returns {Promise<{valid: boolean, errors: ValidationResponseErrors}>} */
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

  /** @returns {BaseModelClassType} */
  modelClass() {
    return /** @type {BaseModelClassType} */ (this.constructor)
  }

  /**
   * @param {string} relationshipName
   * @param {BaseModel | BaseModel[] | null} model
   * @returns {void}
   */
  preloadRelationship(relationshipName, model) {
    this.relationshipsCache[BaseModel.snakeCase(relationshipName)] = model
    this.relationships[BaseModel.snakeCase(relationshipName)] = model
  }

  /** @returns {void} */
  markForDestruction() {
    this._markedForDestruction = true
  }

  /** @returns {boolean} */
  markedForDestruction() { return this._markedForDestruction || false }

  /** @returns {number} */
  uniqueKey() {
    if (!this.uniqueKeyValue) {
      const min = 5000000000000000
      const max = 9007199254740991
      const range = max - min + 1
      this.uniqueKeyValue = Math.floor(Math.random() * range) + min
    }

    return this.uniqueKeyValue
  }

  /**
   * @param {ModelCommandDescriptor} args
   * @param {ModelCommandOptions} commandArgs
   * @returns {Promise<ModelCommandResponse>}
   */
  static async _callCollectionCommand(args, commandArgs) {
    const formOrDataObject = args.args

    try {
      return await CommandsPool.addCommand(args, commandArgs)
    } catch (error) {
      let form

      if (commandArgs.form) {
        form = commandArgs.form
      } else if (formOrDataObject && BaseModel._isFormElement(formOrDataObject)) {
        form = formOrDataObject
      }

      if (form) BaseModel.parseValidationErrors({error, options: {form}})

      throw error
    }
  }

  /**
   * @param {ModelCommandDescriptor} args
   * @param {ModelCommandOptions} commandArgs
   * @returns {import("./command-execution.js").default}
   */
  _callMemberCommand(args, commandArgs) {
    return CommandsPool.addCommand(args, commandArgs)
  }

  /**
   * @param {FormData | ModelDataMap} [args]
   * @returns {FormData}
   */
  static _postDataFromArgs(args) {
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

  /**
   * @param {string} attributeName
   * @returns {ModelValue | null | undefined}
   */
  readAttribute(attributeName) {
    const attributeNameUnderscore = inflection.underscore(attributeName)

    return this.readAttributeUnderscore(attributeNameUnderscore)
  }

  /**
   * @param {string} attributeName
   * @returns {ModelValue | null | undefined}
   */
  readAttributeUnderscore(attributeName) {
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

  /**
   * @param {string} attributeName
   * @returns {boolean}
   */
  isAttributeLoaded(attributeName) {
    const attributeNameUnderscore = inflection.underscore(attributeName)

    if (attributeNameUnderscore in this.changes) return true
    if (attributeNameUnderscore in this.modelData) return true
    return false
  }

  /**
   * @param {ModelValue | null | undefined} value
   * @returns {boolean}
   */
  _isPresent(value) {
    if (!value) {
      return false
    } else if (typeof value == "string" && value.match(/^\s*$/)) {
      return false
    }

    return true
  }

  /**
   *
   * @param {RelationshipLoadArgs} args
   * @param {import("./collection.js").QueryArgsType} queryArgs
   * @returns {Promise<BaseModel | null>}
   */
  async _loadBelongsToReflection(args, queryArgs = {}) {
    if (args.reflectionName in this.relationships) {
      return /** @type {BaseModel | null} */ (this.relationships[args.reflectionName])
    } else if (args.reflectionName in this.relationshipsCache) {
      return /** @type {BaseModel | null} */ (this.relationshipsCache[args.reflectionName])
    } else {
      const collection = new Collection(
        /** @type {import("./collection.js").CollectionArgsType<typeof BaseModel>} */ (args),
        queryArgs
      )
      const model = await collection.first()
      this.relationshipsCache[args.reflectionName] = model
      return model
    }
  }

  /**
   *
   * @param {RelationshipLoadArgs} args
   * @returns {BaseModel | null}
   */
  _readBelongsToReflection({reflectionName}) {
    if (reflectionName in this.relationships) {
      return /** @type {BaseModel | null} */ (this.relationships[reflectionName])
    } else if (reflectionName in this.relationshipsCache) {
      return /** @type {BaseModel | null} */ (this.relationshipsCache[reflectionName])
    }

    if (this.isNewRecord()) return null

    const loadedRelationships = Object.keys(this.relationshipsCache)
    const modelClassName = digg(this.modelClassData(), "name")

    throw new NotLoadedError(`${modelClassName}#${reflectionName} hasn't been loaded yet. Only these were loaded: ${loadedRelationships.join(", ")}`)
  }

  /**
   *
   * @param {RelationshipLoadArgs} args
   * @param {import("./collection.js").QueryArgsType} queryArgs
   * @returns {Promise<BaseModel[]>}
   */
  async _loadHasManyReflection(args, queryArgs = {}) {
    if (args.reflectionName in this.relationships) {
      return /** @type {BaseModel[]} */ (this.relationships[args.reflectionName])
    } else if (args.reflectionName in this.relationshipsCache) {
      return /** @type {BaseModel[]} */ (this.relationshipsCache[args.reflectionName])
    }

    const collection = new Collection(
      /** @type {import("./collection.js").CollectionArgsType<typeof BaseModel>} */ (args),
      queryArgs
    )
    const models = await collection.toArray()

    this.relationshipsCache[args.reflectionName] = models

    return models
  }

  /**
   *
   * @param {RelationshipLoadArgs} args
   * @param {import("./collection.js").QueryArgsType} queryArgs
   * @returns {Promise<BaseModel | null>}
   */
  async _loadHasOneReflection(args, queryArgs = {}) {
    if (args.reflectionName in this.relationships) {
      return /** @type {BaseModel | null} */ (this.relationships[args.reflectionName])
    } else if (args.reflectionName in this.relationshipsCache) {
      return /** @type {BaseModel | null} */ (this.relationshipsCache[args.reflectionName])
    } else {
      const collection = new Collection(
        /** @type {import("./collection.js").CollectionArgsType<typeof BaseModel>} */ (args),
        queryArgs
      )
      const model = await collection.first()

      this.relationshipsCache[args.reflectionName] = model

      return model
    }
  }

  /**
   *
   * @param {RelationshipLoadArgs} args
   * @returns {BaseModel | null}
   */
  _readHasOneReflection({reflectionName}) {
    if (reflectionName in this.relationships) {
      return /** @type {BaseModel | null} */ (this.relationships[reflectionName])
    } else if (reflectionName in this.relationshipsCache) {
      return /** @type {BaseModel | null} */ (this.relationshipsCache[reflectionName])
    }

    if (this.isNewRecord()) {
      return null
    }

    const loadedRelationships = Object.keys(this.relationshipsCache)
    const modelClassName = digg(this.modelClassData(), "name")

    throw new NotLoadedError(`${modelClassName}#${reflectionName} hasn't been loaded yet. Only these were loaded: ${loadedRelationships.join(", ")}`)
  }

  /**
   * @param {BaseModelArgsObject} [args]
   * @returns {void}
   */
  _readModelDataFromArgs(args) {
    this.abilities = args.data.b || {}
    this.collection = args.collection
    this.modelData = objectToUnderscore(args.data.a)
    this.preloadedRelationships = args.data.r
  }

  /**
   * @param {{getModel: (relationshipType: string, relationshipId: number | string) => BaseModel}} preloaded
   * @returns {void}
   */
  _readPreloadedRelationships(preloaded) {
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

  /** @returns {number | string} */
  primaryKey() {
    return /** @type {number | string} */ (this.readAttributeUnderscore(this.modelClass().primaryKey()))
  }
}

export default BaseModel
