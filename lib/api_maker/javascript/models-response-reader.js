import inflection from "inflection"

export default class ModelsResponseReader {
  static first(response) {
    return ModelsResponseReader.collection(response)[0]
  }

  static collection(response) {
    let reader = new ModelsResponseReader({response: response})
    return reader.models()
  }

  constructor(args) {
    this.response = args.response
  }

  models() {
    let models = []

    for(let modelData of this.response.data) {
      let modelClassName = inflection.dasherize(inflection.singularize(modelData.type))
      let modelClass = require(`api-maker/models/${modelClassName}`).default
      let model = new modelClass({data: modelData, response: this.response})

      models.push(model)
    }

    return models
  }
}
