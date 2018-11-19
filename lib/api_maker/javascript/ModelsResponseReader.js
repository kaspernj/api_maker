import inflection from "inflection"

export default class ModelsResponseReader {
  constructor(args) {
    this.response = args.response
  }

  models() {
    var models = []

    for(var modelData of this.response.data) {
      var modelClassName = inflection.classify(inflection.singularize(modelData.type))
      var modelClass = require(`ApiMaker/Models/${modelClassName}`).default
      var model = new modelClass({data: modelData, response: this.response})

      models.push(model)
    }

    return models
  }
}
