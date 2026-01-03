import ModelRecipesLoader from "./model-recipes-loader.js"
import modelRecipes from "model-recipes.json" // eslint-disable-line import/no-unresolved

const loader = new ModelRecipesLoader({recipes: modelRecipes})
const result = loader.load()

export default result
