import Preloaded from "./preloaded"

const inflection = require("inflection")

export default class ModelsResponseReader {
  static first(response) {
    return ModelsResponseReader.collection(response)[0]
  }

  static collection(response) {
    const reader = new ModelsResponseReader({response: response})
    return reader.models()
  }

  constructor(args) {
    this.collection = args.collection
    this.response = args.response
  }

  models() {
    const preloaded = new Preloaded(this.response)
    const models = []

    for(const modelType in this.response.data) {
      const modelClassName = inflection.singularize(modelType)
      const modelClass = require(`api-maker/models/${modelClassName}`).default
      const collectionName = inflection.dasherize(modelClass.modelClassData().collectionName)

      for(const modelId of this.response.data[modelType]) {
        const modelData = this.response.preloaded[collectionName][modelId]

        if (!modelData)
          throw new Error(`Couldn't find model data for ${collectionName}(${modelId})`)

        const model = new modelClass({
          collection: this.collection,
          data: modelData,
          isNewRecord: false
        })

        model._readPreloadedRelationships(preloaded)
        models.push(model)
      }
    }

    return models
  }
}
