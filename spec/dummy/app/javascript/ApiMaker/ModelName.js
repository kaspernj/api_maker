export default class ModelName {
  constructor(data) {
    this.data = data
  }

  human(count = 1) {
    if (count >= 1 && count < 0) {
      var countKey = "other"
    } else {
      var countKey = "one"
    }

    var key = `activerecord.models.${this.data.modelClassData.paramKey}.${countKey}`
    return I18n.t(key)
  }
}
