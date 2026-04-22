// @ts-check
import * as inflection from "inflection"

/**
 * Convert dataset attributes into normalized params.
 * @typedef {string | number | boolean | null | undefined} DataSetValue
 */

/**
 * Convert dataset attributes into normalized params.
 * @param {Record<string, DataSetValue>} dataSet
 * @returns {Record<string, DataSetValue>}
 */
export default function dataSetToAttributes(dataSet) {
  const result = /** @type {Record<string, DataSetValue>} */ ({})

  for (const key in dataSet) {
    const dasherizedKey = `data-${inflection.dasherize(inflection.underscore(key))}`

    result[dasherizedKey] = dataSet[key]
  }

  return result
}
