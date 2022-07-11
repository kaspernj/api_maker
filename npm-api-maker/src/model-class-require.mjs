import {digg} from "diggerize"
import inflection from "inflection"
import * as models from "@kaspernj/api-maker/src/models.mjs.erb"

export default (modelName) => {
  const requireName = inflection.camelize(modelName)
  const ModelClass = digg(models, requireName)

  return ModelClass
}
