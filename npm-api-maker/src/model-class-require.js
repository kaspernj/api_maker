import * as inflection from "inflection"
import models from "models"

const modelClassRequire = (modelName) => {
  const requireName = inflection.camelize(modelName)
  const ModelClass = models[requireName]

  if (!ModelClass) {
    const modelClasses = Object.keys(models).sort()

    throw new Error(`No model called ${modelName} in ${modelClasses.join(", ")}`)
  }

  return ModelClass
}

export default modelClassRequire
