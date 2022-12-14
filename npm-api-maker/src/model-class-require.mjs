import {digg} from "diggerize"
import * as inflection from "inflection"
import * as models from "./models.mjs.erb"

export default (modelName) => {
  const requireName = inflection.camelize(modelName)
  const ModelClass = digg(models, requireName)

  return ModelClass
}
