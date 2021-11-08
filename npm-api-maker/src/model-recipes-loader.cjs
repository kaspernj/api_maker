const {digs} = require("diggerize")
const ModelRecipesModelLoader = require("./model-recipes-model-loader.cjs")

module.exports = class ModelRecipesLoader {
  constructor({recipes}) {
    this.recipes = recipes
  }

  load() {
    const {recipes} = digs(this, "recipes")
    const {models} = digs(recipes, "models")
    const result = {}

    for (const modelName in models) {
      const modelRecipe = models[modelName]
      const modelClassLoader = new ModelRecipesModelLoader({modelRecipe})
      const modelClass = modelClassLoader.createClass()

      result[modelName] = modelClass
    }

    return result
  }
}
