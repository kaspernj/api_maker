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

  static ransack(query) {
    return new Promise((resolve, reject) => {
      var dataToUse = {"q": $.query(query)}
      var urlToUse = this.modelClassData().path

      Rails.ajax({
        type: "GET",
        url: urlToUse,
        data: dataToUse,
        success: (response) => {
          var result = []
          for(var key in response.collection) {
            var modelClass = require("ApiMaker/Models/" + this.modelClassData().name).default
            var modelData = response.collection[key]
            var model = new modelClass({"modelData": modelData})
            result.push(model)
          }

          resolve(result)
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
    for(var key in newAttributes) {
      var oldValue = this.modelData[key]
      var newValue = newAttributes[key]

      if (oldValue != newValue)
        this.changes[key] = newValue
    }
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
      var urlToUse = this.constructor.modelClassData().path
      var modelData = Object.extend({}, this.modelData, this.changes)
      var dataToUse = {modelName: modelData}

      Rails.ajax({type: "GET", url: urlToUse, data: dataToUse, success: (response) => {
        if (response.model) {
          this.modelData = response.model
          this.changes = {}
        }

        if (response.success) {
          resolve(response)
        } else {
          reject(response)
        }
      }})
    })
  }

  destroy() {
    return new Promise((resolve, reject) => {
      var urlToUse = this.constructor.modelClassData().path + "/" + this.id()

      Rails.ajax({type: "DELETE", url: urlToUse, success: (response) => {
        if (response.model) {
          this.modelData = response.model
          this.changes = {}
        }

        if (response.success) {
          resolve(response)
        } else {
          reject(response)
        }
      }})
    })
  }

  getAttribute(attributeName) {
    if (attributeName in this.changes) {
      return this.changes[attributeName]
    } else if (attributeName in this.modelData) {
      return this.modelData[attributeName]
    } else {
      throw "No such attribute: " + attributeName
    }
  }

  isNewRecord() {
    if ("id" in this.modelData) {
      return true
    } else {
      return false
    }
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

  reload() {
    return new Promise((resolve, reject) => {
      var urlToUse = this.constructor.modelClassData().path + "/" + this.id()

      Rails.ajax({
        type: "GET",
        url: urlToUse,
        success: (response) => {
          if (response.model) {
            this.modelData = response.model
            this.changes = {}
          }

          resolve(response)
        }
      })
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

    return new Promise((resolve, reject) => {
      if (this.changes.length == 0)
        return resolve({model: this})

      var paramKey = this.constructor.modelClassData().paramKey
      var urlToUse = this.constructor.modelClassData().path + "/" + this.id()
      var dataToUse = {}
      dataToUse[paramKey] = this.changes

      var xhr = new XMLHttpRequest()
      xhr.open("PATCH", urlToUse)
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.setRequestHeader("X-CSRF-Token", this._token())
      xhr.onload = () => {
        if (xhr.status == 200) {
          var response = JSON.parse(xhr.responseText)

          if (response.model) {
            this.modelData = response.model
            this.changes = {}
          }

          if (response.success) {
            resolve({"model": this, "response": response})
          } else {
            reject({"model": this, "response": response})
          }
        } else {
          reject({"model": this, "responseText": xhr.responseText})
        }
      }
      xhr.send(JSON.stringify(dataToUse))
    })
  }

  isValid() {
    throw "Not implemented yet"
  }

  _token() {
    var csrfTokenElement = document.querySelector("meta[name='csrf-token']")
    if (csrfTokenElement)
      return csrfTokenElement.getAttribute("content")
  }
}
