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

  create() {
    throw "Not implemented yet"
  }

  destroy() {
    throw "Not implemented"
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
    throw "Not implemented yet"
  }

  update(newAttributes = null) {
    if (newAttributes)
      this.assignAttributes(newAttributes)

    throw "Not implemented yet"
  }

  valid() {
    throw "Not implemented yet"
  }
}
