// @ts-check
import * as inflection from "inflection"

/** @typedef {import("../base-model.js").default} BaseModel */

/**
 * Build callback args for table model actions.
 * @param {{props: {modelClass: {modelClassData(): {name: string}}}}} table
 * @param {BaseModel} model
 * @returns {Record<string, BaseModel>}
 */
export default function modelCallbackArgs(table, model) {
  const modelArgName = inflection.camelize(table.props.modelClass.modelClassData().name, true)
  const modelCallbackArgs = /** @type {Record<string, BaseModel>} */ ({model})

  modelCallbackArgs[modelArgName] = model

  return modelCallbackArgs
}
