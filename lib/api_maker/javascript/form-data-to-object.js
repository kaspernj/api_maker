export default class FormDataToObject {
  static toObject(formData) {
    var formDataToObject = new FormDataToObject(formData)
    return formDataToObject.toObject()
  }

  constructor(formData) {
    this.formData = formData
  }

  toObject() {
    var result = {}

    for(var entry of this.formData.entries()) {
      var key = entry[0]
      var value = entry[1]

      this.treatInitial(key, value, result)
    }

    return result
  }

  treatInitial(key, value, result) {
    var firstMatch = key.match(/^(.+?)(\[([\s\S]+$))/)

    if (firstMatch) {
      var inputName = firstMatch[1]
      var rest = firstMatch[2]

      if (inputName in result) {
        var newResult = result[inputName]
      } else {
        var newResult = {}
        result[inputName] = newResult
      }

      this.treatSecond(value, rest, newResult)
    } else {
      result[key] = value
    }
  }

  treatSecond(value, rest, result) {
    var secondMatch = rest.match(/^\[(.+?)\]([\s\S]*)$/)
    var key = secondMatch[1]
    var newRest = secondMatch[2]

    if (newRest == "") {
      result[key] = value
    } else {
      if (key in result) {
        var newResult = result[key]
      } else {
        var newResult = {}
        result[key] = newResult
      }

      this.treatSecond(value, newRest, newResult)
    }
  }
}
