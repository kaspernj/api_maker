import Included from "./included"

const inflection = require("inflection")

export default class ModelsResponseReader {
  static first(response) {
    return ModelsResponseReader.collection(response)[0]
  }

  static collection(response) {
    var reader = new ModelsResponseReader({response: response})
    return reader.models()
  }

  constructor(args) {
    this.response = args.response
  }

  models() {
    var included = new Included(this.response)
    var models = []

    for(var modelType in this.response.data) {
      var modelClassName = inflection.singularize(modelType)
      var modelClass = require(`api-maker/models/${modelClassName}`).default
      var collectionName = inflection.dasherize(modelClass.modelClassData().pluralName)

      for(var modelId of this.response.data[modelType]) {
        var modelData = this.response.included[collectionName][modelId]

        if (!modelData)
          throw new Error(`Couldn't find model data for ${collectionName}(${modelId})`)

        var model = new modelClass({data: modelData, isNewRecord: false, response: this.response})

        model._readIncludedRelationships(included)
        models.push(model)
      }
    }

    return models
  }
}
