import {digg} from "diggerize"
import inflection from "inflection"

export default (modelName) => {
  const requireName = inflection.camelize(modelName)
  const ModelClass = digg(require("@kaspernj/api-maker/src/models.mjs"), requireName)

  return ModelClass
}
