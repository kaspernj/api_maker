const {digg} = require("@kaspernj/object-digger")
const inflection = require("inflection")

module.exports = class ApiMakerPreloaded {
  constructor(response) {
    this.response = response
    this.loadPreloadedModels()
  }

  loadPreloadedModels() {
    this.preloaded = {}

    for(const preloadedType in this.response.preloaded) {
      const modelClassName = inflection.classify(preloadedType.replace(/-/g, "_"))
      const modelClass = digg(require("api-maker/models"), modelClassName)

      for(const preloadedId in this.response.preloaded[preloadedType]) {
        const preloadedData = this.response.preloaded[preloadedType][preloadedId]
        const model = new modelClass({data: preloadedData, isNewRecord: false})

        if (!this.preloaded[preloadedType])
          this.preloaded[preloadedType] = {}

        this.preloaded[preloadedType][preloadedId] = model
      }
    }

    for(const modelType in this.preloaded) {
      for(const modelId in this.preloaded[modelType]) {
        this.preloaded[modelType][modelId]._readPreloadedRelationships(this)
      }
    }
  }

  getModel(type, id) {
    if (!this.preloaded[type] || !this.preloaded[type][id])
      throw new Error(`Could not find a ${type} by that ID: ${id}`)

    return this.preloaded[type][id]
  }
}
