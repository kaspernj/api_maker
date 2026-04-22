// @ts-check
import SparkMD5 from "spark-md5"

/** @typedef {import("./base-model.js").default} BaseModel */
/** @typedef {{append(value: string): void, end(): string}} HashWriter */
/** @typedef {string | number} ModelIdentifier */
/** @typedef {string | number | boolean | null | undefined | {toString(): string}} CacheKeyAttributeValue */
/** @typedef {{name: string}} CacheKeyModelClassData */
/**
 * @typedef {object} CacheKeyModel
 * @property {() => Record<string, CacheKeyAttributeValue>} attributes
 * @property {() => boolean} markedForDestruction
 * @property {() => CacheKeyModelClassData} modelClassData
 * @property {() => {primaryKey(): string}} modelClass
 * @property {() => ModelIdentifier | null | undefined | ""} primaryKey
 * @property {(attributeName: string) => CacheKeyAttributeValue} readAttributeUnderscore
 * @property {(attributeName: string) => boolean} isAttributeLoaded
 * @property {Record<string, CacheKeyModel | Array<CacheKeyModel> | null | undefined>} relationships
 * @property {() => ModelIdentifier} uniqueKey
 */

/** Generates local/full cache keys for models. */
export default class CacheKeyGenerator {
  /**
   * Creates a cache-key generator rooted at one model instance.
   * @param {CacheKeyModel} model
   */
  constructor(model) {
    this.model = model
    this.allModels = [model]
    this.readModels = {}
    this.recordModelType(model.modelClassData().name)
    this.recordModel(model.modelClassData().name, model)
    this.filledModels = false
  }

  /**
   * Builds a cache key from the root model only.
   * @returns {string}
   */
  local() {
    const md5 = new SparkMD5()

    this.feedModel(this.model, md5)

    return md5.end()
  }

  /**
   * Ensures one relationship type has a tracking bucket.
   * @param {string} relationshipType
   */
  recordModelType(relationshipType) {
    if (!(relationshipType in this.readModels)) {
      this.readModels[relationshipType] = {}
    }
  }

  /**
   * Records one related model under its relationship type.
   * @param {string} relationshipType
   * @param {CacheKeyModel} model
   */
  recordModel(relationshipType, model) {
    this.allModels.push(model)
    this.readModels[relationshipType][this.modelIdentity(model)] = true
  }

  /**
   * Returns true when a related model has already been visited for one relationship type.
   * @param {string} relationshipType
   * @param {CacheKeyModel} model
   * @returns {boolean}
   */
  isModelRecorded(relationshipType, model) {
    if (this.modelIdentity(model) in this.readModels[relationshipType]) {
      return true
    }

    return false
  }

  /**
   * Traverses loaded relationships so they are included in the full cache key.
   * @param {CacheKeyModel} model
   */
  fillModels(model) {
    for (const relationshipType in model.relationships) {
      this.recordModelType(relationshipType)

      const loadedRelationship = model.relationships[relationshipType]

      if (Array.isArray(loadedRelationship)) { // has_many
        for (const anotherModel of loadedRelationship) {
          if (!this.isModelRecorded(relationshipType, anotherModel)) {
            this.recordModel(relationshipType, anotherModel)
            this.fillModels(anotherModel)
          }
        }
      } else if (loadedRelationship) { // belongs_to, has_one
        if (!this.isModelRecorded(relationshipType, loadedRelationship)) {
          this.recordModel(relationshipType, loadedRelationship)
          this.fillModels(loadedRelationship)
        }
      }
    }

    this.filledModels = true
  }

  /**
   * Builds a cache key that includes the root model and all loaded related models.
   * @returns {string}
   */
  cacheKey() {
    if (!this.filledModels) {
      this.fillModels(this.model)
    }

    const md5 = new SparkMD5()

    for (const model of this.allModels) {
      this.feedModel(model, md5)
    }

    return md5.end()
  }

  /**
   * Appends one model's identity and loaded attributes to the running hash.
   * @param {CacheKeyModel} model
   * @param {HashWriter} md5
   */
  feedModel(model, md5) {
    md5.append("--model--")
    md5.append(model.modelClassData().name)
    md5.append("--unique-key--")
    md5.append(String(this.modelIdentity(model)))

    if (model.markedForDestruction()) {
      md5.append("--marked-for-destruction--")
    }

    md5.append("-attributes-")

    const attributes = model.attributes()

    for (const attributeName in attributes) {
      md5.append(attributeName)
      md5.append("--attribute--")
      md5.append(String(model.readAttributeUnderscore(attributeName)))
    }
  }

  /**
   * Returns the persisted primary key when available, otherwise the temporary unique key.
   * @param {CacheKeyModel} model
   * @returns {ModelIdentifier}
   */
  modelIdentity(model) {
    const primaryKeyName = model.modelClass().primaryKey()

    if (model.isAttributeLoaded(primaryKeyName)) {
      const primaryKeyValue = model.primaryKey()

      if (primaryKeyValue !== null && primaryKeyValue !== undefined && primaryKeyValue !== "") {
        return primaryKeyValue
      }
    }

    return model.uniqueKey()
  }
}
