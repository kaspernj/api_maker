import * as models from "models.js" // eslint-disable-line import/no-unresolved

/** Super-admin model list. */
const modelsAsArray = []

for (const modelKey of Object.keys(models)) {
  const model = models[modelKey]

  modelsAsArray.push(model)
}

export default modelsAsArray
