const inflection = require("inflection")

export default class ApiMakerIncluded {
  constructor(response) {
    this.response = response
    this.loadIncludedModels()
  }

  loadIncludedModels() {
    this.included = {}

    for(var includedData of this.response.included) {
      var modelClassName = inflection.dasherize(inflection.singularize(includedData.type))
      var modelClass = require(`api-maker/models/${modelClassName}`).default
      var model = new modelClass({data: includedData, response: this.response})

      if (!this.included[includedData.type])
        this.included[includedData.type] = {}

      this.included[includedData.type][includedData.id] = model
    }

    for(var modelType in this.included) {
      for(var modelId in this.included[modelType]) {
        this.included[modelType][modelId]._readIncludedRelationships(this)
      }
    }
  }

  getModel(type, id) {
    if (!this.included[type] || !this.included[type][id])
      throw new Error(`Could not find a ${type} by that ID: ${id}`)

    return this.included[type][id]
  }
}
