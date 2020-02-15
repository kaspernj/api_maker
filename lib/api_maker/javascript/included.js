const inflection = require("inflection")

export default class ApiMakerIncluded {
  constructor(response) {
    this.response = response
    this.loadIncludedModels()
  }

  loadIncludedModels() {
    this.included = {}

    for(const includedType in this.response.included) {
      for(const includedId in this.response.included[includedType]) {
        const includedData = this.response.included[includedType][includedId]
        const modelClassName = inflection.dasherize(inflection.singularize(includedType))
        const modelClass = require(`api-maker/models/${modelClassName}`).default
        const model = new modelClass({data: includedData, isNewRecord: false})

        if (!this.included[includedType])
          this.included[includedType] = {}

        this.included[includedType][includedId] = model
      }
    }

    for(const modelType in this.included) {
      for(const modelId in this.included[modelType]) {
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
