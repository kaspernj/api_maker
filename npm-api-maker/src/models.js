import ModelRecipesLoader from "./model-recipes-loader.js"
import modelRecipes from "model-recipes.json" // eslint-disable-line import/no-unresolved

/** Generated runtime models map. */
const loader = new ModelRecipesLoader({recipes: modelRecipes})
const result = loader.load()

export default result
