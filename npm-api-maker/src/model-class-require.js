// @ts-check
import * as inflection from "inflection"

// @ts-expect-error
import * as models from "models.js" // eslint-disable-line import/no-unresolved

/** @typedef {import("./base-model.js").BaseModelClassType} ModelClassLike */

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
