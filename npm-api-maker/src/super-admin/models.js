import * as models from "models"

const modelsAsArray = []

for (const modelKey of Object.keys(models)) {
  const model = modelsModule[modelKey]

  modelsAsArray.push(model)
}

export default modelsAsArray
