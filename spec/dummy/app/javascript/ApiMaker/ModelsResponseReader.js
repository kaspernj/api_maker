import inflection from "inflection"

export default class ModelsResponseReader {
  constructor(args) {
    this.response = args.response
  }

  models() {
    let models = []

    for(let modelData of this.response.data) {
      let modelClassName = inflection.classify(inflection.singularize(modelData.type))
      let modelClass = require(`ApiMaker/Models/${modelClassName}`).default
      let model = new modelClass({data: modelData, response: this.response})

      models.push(model)
    }

    return models
  }
}
