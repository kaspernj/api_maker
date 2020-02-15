import Api from "./api"
import { CustomError } from "./errors"
import Deserializer from "./deserializer"
import FormDataToObject from "./form-data-to-object"
import { objectToFormData } from "object-to-formdata"

export default class ApiMakerCommandsPool {
  static addCommand(data, args = {}) {
    let pool

    if (args.instant) {
      pool = new ApiMakerCommandsPool()
    } else {
      pool = ApiMakerCommandsPool.current()
    }

    const promiseResult = pool.addCommand(data)

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
    this.globalRequestData = null
  }

  addCommand(data) {
    return new Promise((resolve, reject) => {
      const id = this.currentId
      this.currentId += 1

      const commandType = data.type
      const commandName = data.command
      const collectionName = data.collectionName

      this.pool[id] = {resolve: resolve, reject: reject}

      if (!this.poolData[commandType])
        this.poolData[commandType] = {}

      if (!this.poolData[commandType][collectionName])
        this.poolData[commandType][collectionName] = {}

      if (!this.poolData[commandType][collectionName][commandName])
        this.poolData[commandType][collectionName][commandName] = {}

      let args
      if (data.args instanceof FormData) {
        args = FormDataToObject.toObject(data.args)
      } else {
        args = data.args
      }

      this.poolData[commandType][collectionName][commandName][id] = {
        args: args,
        primary_key: data.primaryKey,
        id: id
      }
    })
  }

  async flush() {
    if (Object.keys(this.pool) == 0)
      return

    this.clearTimeout()

    const currentPool = this.pool
    const currentPoolData = this.poolData

    this.pool = {}
    this.poolData = {}

    const objectForFormData = {pool: currentPoolData}

    if (this.globalRequestData)
      objectForFormData.global = this.globalRequestData

    const formData = objectToFormData(objectForFormData)
    const url = `/api_maker/commands`
    const response = await Api.requestLocal({path: url, method: "POST", rawData: formData})

    for(const commandId in response.responses) {
      const commandResponse = response.responses[commandId]
      const commandResponseData = Deserializer.parse(commandResponse.data)
      const commandData = currentPool[parseInt(commandId)]

      if (commandResponse.type == "success") {
        commandData.resolve(commandResponseData)
      } else if (commandResponse.type == "error") {
        commandData.reject(new CustomError("Command error", {response: commandResponseData}))
      } else {
        commandData.reject(new CustomError("Command failed", {response: commandResponseData}))
      }
    }
  }

  clearTimeout() {
    if (this.flushTimeout)
      clearTimeout(this.flushTimeout)
  }

  setFlushTimeout() {
    this.clearTimeout()
    this.flushTimeout = setTimeout(() => this.flush(), 0)
  }
}
