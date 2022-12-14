import Config from "./config.mjs"
import * as inflection from "inflection"

export default class ModelName {
  constructor(data) {
    this.data = data
  }

  camelizedLower() {
    return this.data.modelClassData.camelizedLower
  }

  human(args) {
    let argsToUse = args

    if (!argsToUse) argsToUse = { count: 1 }

    let countKey

    if (argsToUse.count > 1 || argsToUse.count < 0) {
      countKey = "other"
    } else {
      countKey = "one"
    }

    const key = `activerecord.models.${this.data.modelClassData.i18nKey}.${countKey}`
    let defaultModelName = this.data.modelClassData.name

    if (args?.count > 1) defaultModelName = inflection.pluralize(defaultModelName)

    return Config.getI18n().t(key, {defaultValue: defaultModelName})
  }

  paramKey() {
    return this.data.modelClassData.paramKey
  }
}
