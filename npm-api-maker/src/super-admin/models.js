import * as modelsModule from "@kaspernj/api-maker/src/models.mjs"

const models = []

for (const modelKey of Object.keys(modelsModule)) {
  const model = modelsModule[modelKey]

  models.push(model)
}

export default models
