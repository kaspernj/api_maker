import {digg, digs} from "diggerize"
import ModelRecipesModelLoader from "./model-recipes-model-loader.js"

/** Loader that builds model classes from model recipes. */
export default class ModelRecipesLoader {
  /** @param {{recipes: Record<string, any>}} args */
  constructor ({recipes}) {
    this.modelClasses = {}
    this.recipes = recipes
  }

  /**
   * @param {string} name
   * @returns {typeof import("./base-model.js").default}
   */
  getModelClass (name) {
    return digg(this, "modelClasses", name)
  }

  /** @returns {Record<string, typeof import("./base-model.js").default>} */
  load () {
    const {recipes} = digs(this, "recipes")
    const {models} = digs(recipes, "models")

    for (const modelName in models) {
      const modelRecipe = models[modelName]
      const modelClassLoader = new ModelRecipesModelLoader({modelRecipe, modelRecipesLoader: this})
      const modelClass = modelClassLoader.createClass()

      this.modelClasses[modelName] = modelClass
    }

    return this.modelClasses
  }
}
