// @ts-ignore
import * as models from "models.js"

const modelsAsArray = []

for (const modelKey of Object.keys(models)) {
  const model = models[modelKey]

  modelsAsArray.push(model)
}

export default modelsAsArray
