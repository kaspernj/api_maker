import Api from "./api"
import FormDataToObject from "./form-data-to-object"
import objectToFormData from "object-to-formdata"

export default class ApiMakerCommandsPool {
  static addCommand(data, args = {}) {
    if (args.instant) {
      var pool = new ApiMakerCommandsPool()
    } else {
      var pool = ApiMakerCommandsPool.current()
    }

    var promiseResult = pool.addCommand(data)

    if (args.instant) {
      pool.flush()
    } else {
      pool.setFlushTimeout()
    }

    return promiseResult
  }

  static current() {
    if (!window.currentApiMakerCommandsPool)
      window.currentApiMakerCommandsPool = new ApiMakerCommandsPool()

    return window.currentApiMakerCommandsPool
  }

  static flush() {
    ApiMakerCommandsPool.current().flush()
  }

  constructor() {
    this.pool = {}
    this.poolData = {}
    this.currentId = 1
  }

  addCommand(data) {
    return new Promise((resolve, reject) => {
      var id = this.currentId
      this.currentId += 1

      var commandType = data.type
      var commandName = data.command
      var collectionKey = data.collectionKey

      this.pool[id] = {resolve: resolve, reject: reject}

      if (!this.poolData[commandType])
        this.poolData[commandType] = {}

      if (!this.poolData[commandType][collectionKey])
        this.poolData[commandType][collectionKey] = {}

      if (!this.poolData[commandType][collectionKey][commandName])
        this.poolData[commandType][collectionKey][commandName] = {}

      if (data.args instanceof FormData) {
        var args = FormDataToObject.toObject(data.args)
      } else {
        var args = data.args
      }

      this.poolData[commandType][collectionKey][commandName][id] = {
        args: args,
        primary_key: data.primaryKey,
        id: id
      }
    })
  }

  flush() {
    if (Object.keys(this.pool) == 0)
      return

    this.clearTimeout()

    var currentPool = this.pool
    var currentPoolData = this.poolData

    this.pool = {}
    this.poolData = {}

    var formData = objectToFormData({pool: currentPoolData})
    var url = `/api_maker/commands`

    Api.requestLocal({path: url, method: "POST", rawData: formData}).then((response) => {
      for(var commandId in response.responses) {
        var commandResponse = response.responses[commandId]
        var commandData = currentPool[parseInt(commandId)]

        if (commandResponse.type == "success") {
          commandData.resolve(commandResponse.data)
        } else {
          commandData.reject(commandResponse.data)
        }
      }
    })
  }

  clearTimeout() {
    if (this.flushTimeout)
      clearTimeout(this.flushTimeout)
  }

  setFlushTimeout() {
    this.clearTimeout()
    this.flushTimeout = setTimeout(() => { this.flush() }, 0)
  }
}
