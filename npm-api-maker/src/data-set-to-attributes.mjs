import * as inflection from "inflection"

export default function dataSetToAttributes(dataSet) {
  const result = {}

  for (const key in dataSet) {
    const dasherizedKey = `data-${inflection.dasherize(inflection.underscore(key))}`

    result[dasherizedKey] = dataSet[key]
  }

  return result
}
