import Included from "./included"

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
    this.response = args.response
  }

  models() {
    const included = new Included(this.response)
    const models = []

    for(const modelType in this.response.data) {
      const modelClassName = inflection.singularize(modelType)
      const modelClass = require(`api-maker/models/${modelClassName}`).default
      const collectionName = inflection.dasherize(modelClass.modelClassData().collectionName)

      for(const modelId of this.response.data[modelType]) {
        const modelData = this.response.included[collectionName][modelId]

        if (!modelData)
          throw new Error(`Couldn't find model data for ${collectionName}(${modelId})`)

        const model = new modelClass({data: modelData, isNewRecord: false, response: this.response})

        model._readIncludedRelationships(included)
        models.push(model)
      }
    }

    return models
  }
}
