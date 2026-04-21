// @ts-check
import SparkMD5 from "spark-md5"

/** Generates local/full cache keys for models. */
export default class CacheKeyGenerator {
  /**
   * Constructor.
   * @param {any} model
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
   * local.
   * @returns {any}
   */
  local() {
    const md5 = new SparkMD5()

    this.feedModel(this.model, md5)

    return md5.end()
  }

  /**
   * recordModelType.
   * @param {any} relationshipType
   */
  recordModelType(relationshipType) {
    if (!(relationshipType in this.readModels)) {
      this.readModels[relationshipType] = {}
    }
  }

  /**
   * recordModel.
   * @param {any} relationshipType
   * @param {any} model
   */
  recordModel(relationshipType, model) {
    this.allModels.push(model)
    this.readModels[relationshipType][this.modelIdentity(model)] = true
  }

  /**
   * isModelRecorded.
   * @param {any} relationshipType
   * @param {any} model
   * @returns {boolean}
   */
  isModelRecorded(relationshipType, model) {
    if (this.modelIdentity(model) in this.readModels[relationshipType]) {
      return true
    }

    return false
  }

  /**
   * fillModels.
   * @param {any} model
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
   * cacheKey.
   * @returns {any}
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
   * feedModel.
   * @param {any} model
   * @param {any} md5
   */
  feedModel(model, md5) {
    md5.append("--model--")
    md5.append(model.modelClassData().name)
    md5.append("--unique-key--")
    md5.append(this.modelIdentity(model))

    if (model.markedForDestruction()) {
      md5.append("--marked-for-destruction--")
    }

    md5.append("-attributes-")

    const attributes = model.attributes()

    for (const attributeName in attributes) {
      md5.append(attributeName)
      md5.append("--attribute--")
      md5.append(`${model.readAttributeUnderscore(attributeName)}`)
    }
  }

  /**
   * @param {any} model
   * @returns {number | string}
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
