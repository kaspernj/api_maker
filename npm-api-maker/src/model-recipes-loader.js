import {digg, digs} from "diggerize"
import ModelRecipesModelLoader from "./model-recipes-model-loader.js"

export default class ModelRecipesLoader {
  constructor ({recipes}) {
    this.modelClasses = {}
    this.recipes = recipes
  }

  getModelClass (name) {
    return digg(this, "modelClasses", name)
  }

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
