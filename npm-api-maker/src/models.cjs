/* rails-erb-loader-dependencies api_maker/resources/ */

const modelRecipes = require("./model-recipes.cjs.erb")
const ModelRecipesLoader = require("./model-recipes-loader.cjs")

const loader = new ModelRecipesLoader({recipes: modelRecipes})
const result = loader.load()

module.exports = result
