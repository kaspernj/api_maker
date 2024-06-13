import Api from "./api.mjs"
import CommandSubmitData from "./command-submit-data.mjs"
import CustomError from "./custom-error.mjs"
import DestroyError from "./destroy-error.mjs"
import Deserializer from "./deserializer.mjs"
import {dig, digg} from "diggerize"
import events from "./events.mjs"
import FormDataObjectizer from "form-data-objectizer"
import RunLast from "./run-last.mjs"
import Serializer from "./serializer.mjs"
import SessionStatusUpdater from "./session-status-updater.mjs"
import ValidationError from "./validation-error.mjs"
import {ValidationErrors} from "./validation-errors.mjs"

const shared = {}

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
      pool.flushRunLast.run()
    } else {
      pool.flushRunLast.queue()
    }

    return promiseResult
  }

  static current() {
    if (!shared.currentApiMakerCommandsPool) shared.currentApiMakerCommandsPool = new ApiMakerCommandsPool()

    return shared.currentApiMakerCommandsPool
  }

  static flush() {
    ApiMakerCommandsPool.current().flush()
  }

  constructor() {
    this.flushCount = 0
    this.pool = {}
    this.poolData = {}
    this.currentId = 1
    this.globalRequestData = {}
  }

  addCommand(data) {
    const stack = Error().stack

    return new Promise((resolve, reject) => {
      const id = this.currentId
      this.currentId += 1

      const commandType = data.type
      const commandName = data.command
      const collectionName = data.collectionName

      this.pool[id] = {resolve, reject, stack}

      if (!this.poolData[commandType]) this.poolData[commandType] = {}
      if (!this.poolData[commandType][collectionName]) this.poolData[commandType][collectionName] = {}
      if (!this.poolData[commandType][collectionName][commandName]) this.poolData[commandType][collectionName][commandName] = {}

      let args

      if (data.args?.nodeName == "FORM") {
        const formData = new FormData(data.args)

        args = FormDataObjectizer.toObject(formData)
      } else if (data.args instanceof FormData) {
        args = FormDataObjectizer.toObject(data.args)
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

  commandsCount() {
    return Object.keys(this.pool)
  }

  async sendRequest({commandSubmitData, url}) {
    let response

    for (let i = 0; i < 3; i++) {
      if (commandSubmitData.getFilesCount() > 0) {
        response = await Api.requestLocal({path: url, method: "POST", rawData: commandSubmitData.getFormData()})
      } else {
        response = await Api.requestLocal({path: url, method: "POST", data: commandSubmitData.getJsonData()})
      }

      if (response.success === false && response.type == "invalid_authenticity_token") {
        console.log("Invalid authenticity token - try again")
        await SessionStatusUpdater.current().updateSessionStatus()
        continue
      }

      return response
    }

    throw new Error("Couldnt successfully execute request")
  }

  flush = async () => {
    if (this.commandsCount() == 0) {
      return
    }

    const currentPool = this.pool
    const currentPoolData = this.poolData

    this.pool = {}
    this.poolData = {}
    this.flushCount++

    try {
      const submitData = {pool: currentPoolData}

      if (Object.keys(this.globalRequestData).length > 0)
        submitData.global = this.globalRequestData

      const commandSubmitData = new CommandSubmitData(submitData)
      const url = "/api_maker/commands"
      const response = await this.sendRequest({commandSubmitData, url})

      for (const commandId in response.responses) {
        const commandResponse = response.responses[commandId]
        const commandResponseData = Deserializer.parse(commandResponse.data)
        const commandData = currentPool[parseInt(commandId, 10)]
        const responseType = commandResponse.type

        if (commandResponseData && typeof commandResponseData == "object") {
          const bugReportUrl = dig(commandResponseData, "bug_report_url")

          if (bugReportUrl) {
            console.log(`Bug report URL: ${bugReportUrl}`)
          }
        }

        if (responseType == "success") {
          commandData.resolve(commandResponseData)
        } else if (responseType == "error") {
          const error = new CustomError("Command error", {response: commandResponseData})

          error.stack += "\n"
          error.stack += commandData.stack.split("\n").slice(1).join("\n")

          commandData.reject(error)
        } else if (responseType == "failed") {
          this.handleFailedResponse(commandData, commandResponseData)
        } else {
          throw new Error(`Unhandled response type: ${responseType}`)
        }
      }
    } finally {
      this.flushCount--
    }
  }

  handleFailedResponse(commandData, commandResponseData) {
    let error

    if (commandResponseData.error_type == "destroy_error") {
      error = new DestroyError(`Destroy failed`, {response: commandResponseData})
    } else if (commandResponseData.error_type == "validation_error") {
      const validationErrors = new ValidationErrors({
        model: digg(commandResponseData, "model"),
        validationErrors: digg(commandResponseData, "validation_errors")
      })
      error = new ValidationError(validationErrors, {response: commandResponseData})

      events.emit("onValidationErrors", validationErrors)
    } else {
      let errorMessage

      if (!commandResponseData.errors) { errorMessage = "Command failed" }

      error = new CustomError(errorMessage, {response: commandResponseData})
    }

    commandData.reject(error)
  }

  isActive() {
    if (this.commandsCount() > 0) {
      return true
    }

    if (this.flushCount > 0) {
      return true
    }

    return false
  }

  flushRunLast = new RunLast(this.flush)
}
