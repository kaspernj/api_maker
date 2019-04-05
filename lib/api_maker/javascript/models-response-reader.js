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
      for(var modelId in this.response.data[modelType]) {
        var modelData = this.response.data[modelType][modelId]
        var modelClassName = inflection.dasherize(inflection.singularize(modelType))
        var modelClass = require(`api-maker/models/${modelClassName}`).default
        var model = new modelClass({data: modelData, response: this.response})

        model._readIncludedRelationships(included)
        models.push(model)
      }
    }

    return models
  }
}
