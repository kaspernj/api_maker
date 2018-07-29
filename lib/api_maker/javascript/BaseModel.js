export default class {
  static modelClassData() {
    throw "modelClassData should be overriden by child"
  }

  static find(id) {
    return new Promise((resolve, reject) => {
      var urlToUse = this.modelClassData().path + "/" + id

      Rails.ajax({
        type: "GET",
        url: urlToUse,
        success: (response) => {
          var modelClass = require("ApiMaker/Models/" + this.modelClassData().name).default
          var model = new modelClass({"modelData": response.model})
          resolve(model)
        }
      })
    })
  }

  constructor(args) {
    this.changes = {}
    this.modelData = args.modelData
    this.relationshipsCache = {}
  }

  assignAttributes(newAttributes) {
    this.changes = Object.assign({}, this.changes, newAttributes)
  }

  hasChanged() {
    if (this.changes.length > 0) {
      return true
    } else {
      return false
    }
  }

  create() {
    return new Promise(function(resolve, reject) {
      var urlToUse = this.constructor.modelClassData()
      var modelData = Object.extend({}, this.modelData, this.changes)
      var dataToUse = {modelName: modelData}

      Rails.ajax({type: "GET", url: urlToUse, data: dataToUse, success: (response) => {
        if (response.success) {
          resolve(true)
        } else {
          resolve(false)
        }
      }})
    })
  }

  destroy() {
    return new Promise(function(resolve, reject) {
      var urlToUse = this.modelClassData() + "/" + id

      Rails.ajax({type: "DELETE", url: urlToUse, success: (response) => {
        if (response.success) {
          resolve(true)
        } else {
          resolve(false)
        }
      }})
    })
  }

  isNewRecord() {
    throw "Not implemented yet"
  }

  isPersisted() {
    return !this.isNewRecord()
  }

  readBelongsToReflection(args) {
    return new Promise(function(resolve, reject) {
      if (this.relationshipsCache[args.name])
        return resolve(this.relationshipsCache[args.name])

      var ransackKey = args.primaryKey + "_eq"
      var ransackArgs = {
        ransackKey: this.id()
      }

      var collection = new Collection({"modelName": args.modelName, "ransack": ransackArgs})
      collection.first().then((model) => { resolve(model) })
    })
  }

  readHasOneReflection(args) {
    return new Promise(function(resolve, reject) {
      if (this.relationshipsCache[args.name])
        return resolve(this.relationshipsCache[args.name])

      var ransackKey = args.primaryKey + "_eq"
      var ransackArgs = {
        ransackKey: this.id()
      }

      var collection = new Collection({"modelName": args.modelName, "ransack": ransackArgs})
      collection.first().then((model) => { resolve(model) })
    })
  }

  save() {
    if (this.isNewRecord()) {
      return this.create()
    } else {
      return this.update()
    }
  }

  update(newAttributes = null) {
    if (newAttributes)
      this.assignAttributes(newAttributes)

    return new Promise(function(resolve, reject) {
      var urlToUse = this.modelClassData() + "/" + id

      Rails.ajax({type: "GET", url: urlToUse, data: this.changes, success: (response) => {
        if (response.success) {
          resolve(true)
        } else {
          resolve(false)
        }
      }})
    })
  }

  isValid() {
    throw "Not implemented yet"
  }
}
