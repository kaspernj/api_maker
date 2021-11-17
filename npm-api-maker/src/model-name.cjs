module.exports = class ModelName {
  constructor (data) {
    this.data = data
  }

  human (args) {
    let argsToUse = args

    if (!argsToUse) argsToUse = {count: 1}

    let countKey

    if (argsToUse.count > 1 || argsToUse.count < 0) {
      countKey = "other"
    } else {
      countKey = "one"
    }

    const key = `activerecord.models.${this.data.modelClassData.i18nKey}.${countKey}`

    return this.data.i18n.t(key)
  }
}
