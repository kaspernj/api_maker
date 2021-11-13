const {digs} = require("diggerize")
const ModelRecipesModelLoader = require("./model-recipes-model-loader.cjs")

module.exports = class ModelRecipesLoader {
  constructor({recipes}) {
    this.modelClasses = {}
    this.recipes = recipes
  }

  getModelClass(name) {
    return digg(this, "modelClasses", name)
  }

  load() {
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
