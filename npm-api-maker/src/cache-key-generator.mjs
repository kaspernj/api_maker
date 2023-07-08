import SparkMD5 from "spark-md5"

export default class CacheKeyGenerator {
  constructor(model) {
    this.allModels = [model]
    this.readModels = {}
    this.recordModelType(model.modelClassData().name)
    this.recordModel(model.modelClassData().name, model)
    this.fillModels(model)
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

      for (const anotherModel of model.relationships[relationshipType]) {
        if (this.isModelRecorded(relationshipType, anotherModel)) {
          continue
        }

        this.recordModel(relationshipType, anotherModel)
        this.fillModels(anotherModel)
      }
    }
  }

  cacheKey() {
    const md5 = new SparkMD5()

    for (const model of this.allModels) {
      md5.append("-model-")
      md5.append(model.modelClassData().name)
      md5.append("-unique-key-")
      md5.append(model.id() || model.uniqueKey())
      md5.append("-attributes-")

      const attributes = model.attributes()

      for (const attributeName in attributes) {
        md5.append(attributeName)
        md5.append("-attribute-")
        md5.append(`${model.readAttributeUnderscore(attributeName)}`)
      }
    }

    return md5.end()
  }
}
