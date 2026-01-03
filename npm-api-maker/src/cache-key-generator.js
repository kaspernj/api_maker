import SparkMD5 from "spark-md5"

export default class CacheKeyGenerator {
  constructor(model) {
    this.model = model
    this.allModels = [model]
    this.readModels = {}
    this.recordModelType(model.modelClassData().name)
    this.recordModel(model.modelClassData().name, model)
    this.filledModels = false
  }

  local() {
    const md5 = new SparkMD5()

    this.feedModel(this.model, md5)

    return md5.end()
  }

  recordModelType(relationshipType) {
    if (!(relationshipType in this.readModels)) {
      this.readModels[relationshipType] = {}
    }
  }

  recordModel(relationshipType, model) {
    this.allModels.push(model)
    this.readModels[relationshipType][model.id() || model.uniqueKey()] = true
  }

  isModelRecorded(relationshipType, model) {
    if (model.id() in this.readModels[relationshipType]) {
      return true
    }
  }

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

  feedModel(model, md5) {
    md5.append("--model--")
    md5.append(model.modelClassData().name)
    md5.append("--unique-key--")
    md5.append(model.id() || model.uniqueKey())

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
}
