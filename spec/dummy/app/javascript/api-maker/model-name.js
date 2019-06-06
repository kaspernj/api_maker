export default class ModelName {
  constructor(data) {
    this.data = data
  }

  human(args) {
    if (!args)
      args = {count: 1}

    var countKey

    if (args.count > 1 || args.count < 0) {
      countKey = "other"
    } else {
      countKey = "one"
    }

    var key = `activerecord.models.${this.data.modelClassData.i18nKey}.${countKey}`
    return I18n.t(key)
  }
}
