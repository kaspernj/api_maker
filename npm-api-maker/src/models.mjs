import modelRecipes from "./model-recipes.mjs.erb"
import ModelRecipesLoader from "./model-recipes-loader.mjs"

const loader = new ModelRecipesLoader({recipes: modelRecipes})
const result = loader.load()

export default result
