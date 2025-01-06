import objectToFormData from "object-to-formdata"

export default class ApiMakerCommandSubmitData {
  constructor (data) {
    this.data = data
    this.filesCount = 0
    this.jsonData = this.traverseObject(this.data, "json")
  }

  getFilesCount = () => this.filesCount
  getJsonData = () => this.jsonData

  getRawData () {
    if (!this.rawData) {
      this.rawData = this.traverseObject(this.data, "raw")
    }

    return this.rawData
  }

  getFormData () {
    const objectForFormData = this.getRawData() || {}

    objectForFormData.json = JSON.stringify(this.getJsonData())

    const formData = objectToFormData.serialize(objectForFormData)

    return formData
  }

  convertDynamic (value, type) {
    if (Array.isArray(value)) {
      return this.traverseArray(value, type)
    } else if (typeof value == "object" && value !== null && value.constructor.name == "Object") {
      return this.traverseObject(value, type)
    } else {
      return value
    }
  }

  shouldSkip (object, type) {
    if (type == "json" && object instanceof File) {
      this.filesCount += 1
      return true
    }

    if (type == "raw" && !Array.isArray(object) && !this.isObject(object) && !(object instanceof File)) {
      return true
    }

    return false
  }

  isObject (value) {
    if (typeof value == "object" && value !== null && value.constructor.name == "Object") {
      return true
    }

    return false
  }

  traverseArray (array, type) {
    const newArray = []

    for (const value of array) {
      if (this.shouldSkip(value, type)) {
        continue
      }

      if (Array.isArray(value)) {
        newArray.push(this.convertDynamic(value, type))
      } else if (this.isObject(value)) {
        newArray.push(this.convertDynamic(value, type))
      } else {
        newArray.push(value)
      }
    }

    return newArray
  }

  traverseObject (object, type) {
    const newObject = {}

    for (const key in object) {
      const value = object[key]

      if (this.shouldSkip(value, type)) {
        continue
      }

      if (Array.isArray(value)) {
        newObject[key] = this.convertDynamic(value, type)
      } else if (this.isObject(value)) {
        newObject[key] = this.convertDynamic(value, type)
      } else {
        newObject[key] = value
      }
    }

    return newObject
  }
}
