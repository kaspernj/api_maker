const Api = require("./api.cjs")
const CommandSubmitData = require("./command-submit-data.cjs")
const CustomError = require("./custom-error.cjs")
const Deserializer = require("./deserializer.cjs")
const {dig, digg} = require("@kaspernj/object-digger")
const FormDataObjectizer = require("form-data-objectizer")
const Serializer = require("./serializer.cjs")
const ValidationError = require("./validation-error.cjs")
const {ValidationErrors} = require("./validation-errors.cjs")

module.exports = class ApiMakerCommandsPool {
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
    if (!window.currentApiMakerCommandsPool) {
      window.currentApiMakerCommandsPool = new ApiMakerCommandsPool()
    }

    return window.currentApiMakerCommandsPool
  }

  static flush() {
    ApiMakerCommandsPool.current().flush()
  }

  constructor() {
    this.flushCount = 0
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

  async flush() {
    if (this.commandsCount() == 0) {
      return
    }

    this.clearTimeout()

    const currentPool = this.pool
    const currentPoolData = this.poolData

    this.pool = {}
    this.poolData = {}
    this.flushCount++

    try {
      const submitData = {pool: currentPoolData}

      if (this.globalRequestData)
        submitData.global = this.globalRequestData

      const commandSubmitData = new CommandSubmitData(submitData)
      const url = "/api_maker/commands"

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
        const responseType = commandResponse.type

        if (commandResponseData) {
          const bugReportUrl = dig(commandResponseData, "bug_report_url")

          if (bugReportUrl) {
            console.log(`Bug report URL: ${bugReportUrl}`)
          }
        }

        if (responseType == "success") {
          commandData.resolve(commandResponseData)
        } else if (responseType == "error") {
          this.handleErrorResponse(commandData, commandResponseData)
        } else {
          commandData.reject(new CustomError("Command failed", {response: commandResponseData}))
        }
      }
    } finally {
      this.flushCount--
    }
  }

  handleCommandError(commandData, commandResponseData) {
    let error

    if (commandResponseData.error_type == "validation_error") {
      const validationErrors = new ValidationErrors({
        model: digg(commandResponseData, "model"),
        validationErrors: digg(commandResponseData, "validation_errors")
      })
      error = new ValidationError(validationErrors, {response: commandResponseData})
    } else {
      error = new CustomError("Command error", {response: commandResponseData})
    }

    commandData.reject(new CustomError("Command failed", {response: commandResponseData}))
  }

  clearTimeout() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
    }
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

  setFlushTimeout() {
    this.clearTimeout()
    this.flushTimeout = setTimeout(() => this.flush(), 0)
  }
}
