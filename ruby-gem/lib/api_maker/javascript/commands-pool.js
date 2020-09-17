import { Api, CommandSubmitData, CustomError, FormDataToObject } from "@kaspernj/api-maker"
import Deserializer from "./deserializer"
import {Serializer} from "@kaspernj/api-maker"

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

      this.pool[id] = {resolve, reject}

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
        args = Serializer.serialize(data.args)
      }

      this.poolData[commandType][collectionName][commandName][id] = {
        args,
        primary_key: data.primaryKey,
        id
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

    const submitData = {pool: currentPoolData}

    if (this.globalRequestData)
      submitData.global = this.globalRequestData

    const commandSubmitData = new CommandSubmitData(submitData)
    const url = `/api_maker/commands`

    let response

    if (commandSubmitData.getFilesCount() > 0) {
      response = await Api.requestLocal({path: url, method: "POST", rawData: commandSubmitData.getFormData()})
    } else {
      response = await Api.requestLocal({path: url, method: "POST", data: commandSubmitData.getJsonData()})
    }

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
