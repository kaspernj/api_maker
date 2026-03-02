import * as inflection from "inflection"
import Preloaded from "./preloaded.js"
import modelClassRequire from "./model-class-require.js"

/** Builds model instances from backend model collections. */
export default class ModelsResponseReader {
  /**
   * @param {{data: Record<string, any>, preloaded: Record<string, any>}} response
   * @returns {import("./base-model.js").default | undefined}
   */
  static first (response) {
    return ModelsResponseReader.collection(response)[0]
  }

  /**
   * @param {{data: Record<string, any>, preloaded: Record<string, any>}} response
   * @returns {Array<import("./base-model.js").default>}
   */
  static collection (response) {
    const reader = new ModelsResponseReader({response})
    return reader.models()
  }

  /** @param {{collection?: import("./collection.js").default<any>, response: {data: Record<string, any>, preloaded: Record<string, any>}}} args */
  constructor (args) {
    this.collection = args.collection
    this.response = args.response
  }

  /** @returns {Array<import("./base-model.js").default>} */
  models () {
    const preloaded = new Preloaded(this.response)
    const models = []

    for (const modelType in this.response.data) {
      const modelClassName = inflection.classify(modelType)
      const ModelClass = modelClassRequire(modelClassName)
      const collectionName = ModelClass.modelClassData().collectionName

      for (const modelId of this.response.data[modelType]) {
        const modelData = this.response.preloaded[collectionName][modelId]

        if (!modelData)
          throw new Error(`Couldn't find model data for ${collectionName}(${modelId})`)

        const model = new ModelClass({
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
