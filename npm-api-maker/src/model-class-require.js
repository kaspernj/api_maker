// @ts-check
import * as inflection from "inflection"

// @ts-expect-error
import * as models from "models.js" // eslint-disable-line import/no-unresolved

/** @typedef {typeof import("./base-model.js").default} ModelClassLike */

/**
 * @param {string} modelName
 * @returns {ModelClassLike}
 */
export default function modelClassRequire(modelName) {
  const requireName = inflection.camelize(modelName)
  const ModelClass = models[requireName]

  if (!ModelClass) {
    const modelClasses = Object.keys(models).sort()

    throw new Error(`No model called ${modelName} in ${modelClasses.join(", ")}`)
  }

  return ModelClass
}
