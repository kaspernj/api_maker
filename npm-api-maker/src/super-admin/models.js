import * as models from "models"

const modelsAsArray = []

for (const modelKey of Object.keys(models)) {
  const model = models[modelKey]

  modelsAsArray.push(model)
}

export default modelsAsArray
