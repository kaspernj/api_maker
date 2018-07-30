import Collection from "./Collection"

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
          var model = new modelClass(response.model)
          resolve(model)
        }
      })
    })
  }

  static ransack(query) {
    return new Collection({"modelName": this.modelClassData().name, "ransack": query, "targetPathName": this.modelClassData().path})
  }

  constructor(modelData = {}) {
    this.changes = {}
    this.relationshipsCache = {}
    this.modelData = modelData
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
    return new Promise((resolve, reject) => {
      var paramKey = this.constructor.modelClassData().paramKey
      var urlToUse = this.constructor.modelClassData().path
      var modelData = Object.assign({}, this.modelData, this.changes)
      var dataToUse = {}
      dataToUse[paramKey] = modelData

      var xhr = new XMLHttpRequest()
      xhr.open("POST", urlToUse)
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

  destroy() {
    return new Promise((resolve, reject) => {
      var urlToUse = this.constructor.modelClassData().path + "/" + this._primaryKey()

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
      return false
    } else {
      return true
    }
  }

  isPersisted() {
    return !this.isNewRecord()
  }

  reload() {
    return new Promise((resolve, reject) => {
      var urlToUse = this.constructor.modelClassData().path + "/" + this._primaryKey()

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
      var urlToUse = this.constructor.modelClassData().path + "/" + this._primaryKey()
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

  _readBelongsToReflection(args) {
    return new Promise((resolve, reject) => {
      if (this.relationshipsCache[args.name])
        return resolve(this.relationshipsCache[args.name])

      var collection = new Collection(args)
      collection.first().then((model) => { resolve(model) })
    })
  }

  _readHasOneReflection(args) {
    return new Promise((resolve, reject) => {
      if (this.relationshipsCache[args.name])
        return resolve(this.relationshipsCache[args.name])

      var collection = new Collection(args)
      collection.first().then((model) => { resolve(model) })
    })
  }

  _primaryKey() {
    return this.getAttribute(this.constructor.modelClassData().primaryKey)
  }

  _token() {
    var csrfTokenElement = document.querySelector("meta[name='csrf-token']")
    if (csrfTokenElement)
      return csrfTokenElement.getAttribute("content")
  }
}
