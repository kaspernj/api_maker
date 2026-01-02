import modelRecipes from "model-recipes.json"
import ModelRecipesLoader from "./model-recipes-loader.js"

const loader = new ModelRecipesLoader({recipes: modelRecipes})
const result = loader.load()

export default result
