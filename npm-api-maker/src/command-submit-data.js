const objectToFormData = require("object-to-formdata").serialize

export default class ApiMakerCommandSubmitData {
  constructor(data) {
    this.data = data
  }

  getJsonData() {
    return this.traverseObject(this.data, "json")
  }

  getRawData() {
    return this.traverseObject(this.data, "raw")
  }

  getFormData() {
    const objectForFormData = {}

    objectForFormData.json = JSON.stringify(this.getJsonData())
    objectForFormData.raw = this.getRawData()

    const formData = objectToFormData(objectForFormData)

    return formData
  }

  convertDynamic(value, type) {
    if (Array.isArray(value)) {
      return this.traverseArray(value, type)
    } else if (typeof value == "object" && value !== null && value.constructor.name == "Object") {
      return this.traverseObject(value, type)
    } else {
      return value
    }
  }

  shouldSkip(object, type) {
    if (type == "json" && object instanceof File) {
      return true
    }

    if (type == "raw" && !(object instanceof File)) {
      return true
    }

    return false
  }

  traverseArray(array, type) {
    const newArray = []

    for (const value of array) {
      if (this.shouldSkip(value, type)) {
        continue
      }

      if (Array.isArray(value)) {
        newArray.push(this.convertDynamic(value, type))
      } else if (typeof value == "object" && value !== null && value.constructor.name == "Object") {
        newArray.push(this.convertDynamic(value, type))
      } else {
        newArray.push(value)
      }
    }

    return newArray
  }

  traverseObject(object, type) {
    const newObject = {}

    for (const key in object) {
      const value = object[key]

      if (this.shouldSkip(value, type)) {
        continue
      }

      if (Array.isArray(value)) {
        newObject[key] = this.convertDynamic(value, type)
      } else if (typeof value == "object" && value !== null && value.constructor.name == "Object") {
        newObject[key] = this.convertDynamic(value, type)
      } else {
        newObject[key] = value
      }
    }

    return newObject
  }
}
