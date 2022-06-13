const modelRecipes = require("./model-recipes.mjs.erb").default
const ModelRecipesLoader = require("./model-recipes-loader.mjs").default

const loader = new ModelRecipesLoader({recipes: modelRecipes})
const result = loader.load()

module.exports = result
