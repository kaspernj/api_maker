import ModelRecipesLoader from "./model-recipes-loader.js"
// @ts-expect-error Runtime-resolved module
import modelRecipes from "model-recipes.json" // eslint-disable-line import/no-unresolved

/** Generated runtime models map. */
const loader = new ModelRecipesLoader({recipes: modelRecipes})
const result = loader.load()

export default result
