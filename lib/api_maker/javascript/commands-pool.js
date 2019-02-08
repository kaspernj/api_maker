import Api from "./api"
import objectToFormData from "object-to-formdata"

export default class ApiMakerCommandsPool {
  static current() {
    if (!window.currentApiMakerCommandsPool)
      window.currentApiMakerCommandsPool = new ApiMakerCommandsPool()

    return window.currentApiMakerCommandsPool
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
      var pluralName = data.pluralName

      this.pool[id] = {resolve: resolve, reject: reject}

      if (!this.poolData[commandType])
        this.poolData[commandType] = {}

      if (!this.poolData[commandType][pluralName])
        this.poolData[commandType][pluralName] = {}

      if (!this.poolData[commandType][pluralName][commandName])
        this.poolData[commandType][pluralName][commandName] = {}

      this.poolData[commandType][pluralName][commandName][id] = {
        args: data.args,
        primary_key: data.primaryKey,
        id: id
      }

      this.setFlushTimeout()
    })
  }

  flush() {
    var currentPool = this.pool
    this.pool = {}

    var currentPoolData = this.poolData
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
          commandData.reject()
        }
      }
    })
  }

  setFlushTimeout() {
    if (this.flushTimeout)
      clearTimeout(this.flushTimeout)

    this.flushTimeout = setTimeout(() => { this.flush() }, 50)
  }
}
