module.exports = class FormDataToObject {
  static toObject(formData) {
    const formDataToObject = new FormDataToObject(formData)
    return formDataToObject.toObject()
  }

  constructor(formData) {
    this.formData = formData
  }

  static formDataFromObject(object, options) {
    if (object instanceof FormData) {
      return object
    } else if (object.nodeName == "FORM") {
      if (options) options["form"] = object

      return new FormData(object)
    } else {
      throw new Error("Didnt know how to get form data from that object")
    }
  }

  toObject() {
    const result = {}

    for(const entry of this.formData.entries()) {
      const key = entry[0]
      const value = entry[1]

      this.treatInitial(key, value, result)
    }

    return result
  }

  treatInitial(key, value, result) {
    const firstMatch = key.match(/^(.+?)(\[([\s\S]+$))/)

    if (firstMatch) {
      const inputName = firstMatch[1]
      const rest = firstMatch[2]

      let newResult

      if (inputName in result) {
        newResult = result[inputName]
      } else if (rest == "[]") {
        newResult = []
        result[inputName] = newResult
      } else {
        newResult = {}
        result[inputName] = newResult
      }

      this.treatSecond(value, rest, newResult)
    } else {
      result[key] = value
    }
  }

  treatSecond(value, rest, result) {
    const secondMatch = rest.match(/^\[(.*?)\]([\s\S]*)$/)
    const key = secondMatch[1]
    const newRest = secondMatch[2]

    let newResult

    if (rest == "[]") {
      result.push(value)
    } else if (newRest == "") {
      result[key] = value
    } else {
      if (typeof result == "object" && key in result) {
        newResult = result[key]
      } else if (newRest == "[]") {
        newResult = []
        result[key] = newResult
      } else {
        newResult = {}
        result[key] = newResult
      }

      this.treatSecond(value, newRest, newResult)
    }
  }
}
