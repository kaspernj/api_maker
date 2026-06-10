// @ts-check

import Api from "./api.js"
import ApiMakerCommandExecution from "./command-execution.js"
import CommandSubmitData from "./command-submit-data.js"
import Config from "./config.js"
import CustomError from "./custom-error.js"
import DestroyError from "./destroy-error.js"
import Deserializer from "./deserializer.js" // eslint-disable-line sort-imports
import Devise from "./devise.js"
import {dig, digg} from "diggerize" // eslint-disable-line sort-imports
import events from "./events.js"
import FormDataObjectizer from "form-data-objectizer" // eslint-disable-line sort-imports
import RunLast from "./run-last.js"
import Serializer from "./serializer.js"
import SessionExpiredError from "./session-expired-error.js"
import SessionStatusUpdater from "./session-status-updater.js"
import ValidationError from "./validation-error.js"
import {ValidationErrors} from "./validation-errors.js"
import WebsocketRequestClient from "./websocket-request-client.js"

/** @typedef {object | string | number | boolean | null | undefined} CommandArgumentScalarOrObject */
/** @typedef {CommandArgumentScalarOrObject | File | FormData | HTMLFormElement | CommandArgumentScalarOrObject[]} CommandArgumentValue */
/** @typedef {Record<string, CommandArgumentValue>} CommandArgumentMap */
/**
 * @typedef {object} CommandDescriptor
 * @property {CommandArgumentValue} [args]
 * @property {string} collectionName
 * @property {string} command
 * @property {number | string} [primaryKey]
 * @property {string} type
 */
/**
 * @typedef {object} CommandRequestOptions
 * @property {boolean} [cacheResponse]
 * @property {boolean} [forceHttp]
 * @property {boolean} [instant]
 */
/**
 * @typedef {object} CommandResponseEnvelope
 * @property {CommandArgumentMap} data
 * @property {"success" | "error" | "failed"} type
 */
/**
 * @typedef {object} CommandsRequestResponse
 * @property {Record<string, CommandResponseEnvelope>} responses
 * @property {boolean} [success]
 * @property {string} [type]
 */
/**
 * @typedef {object} FailedCommandResponseData
 * @property {string} error_type
 * @property {string[]} [errors]
 * @property {string[]} [validation_errors]
 * @property {CommandArgumentMap} [model]
 */

/**
 * @typedef {object} CommandDataType
 * @property {ApiMakerCommandExecution} commandExecution
 * @property {string} stack
 */

/** @typedef {{[key: string]: {[key: string]: {[key: string]: {[key: number]: {args: object, primary_key: number | string, id: number}}}}}} PoolDataType */
/** @typedef {import("./base-model.js").default & {id: () => number | string}} BaseModelWithId */

const shared = {}

/** Batches command submissions and flushes them over HTTP or websockets. */
export default class ApiMakerCommandsPool {
  /**
   * Adds a command to the shared or one-off command pool and schedules a flush.
   * @param {CommandDescriptor} data
   * @param {CommandRequestOptions} [args]
   * @returns {ApiMakerCommandExecution}
   */
  static addCommand(data, args = {}) {
    let pool
    const useWebsocketRequests = Config.getWebsocketRequests()

    if (args.instant || useWebsocketRequests) {
      pool = new ApiMakerCommandsPool()
      pool.globalRequestData = {...ApiMakerCommandsPool.current().globalRequestData}
      pool.requestOptions = {...args}
    } else {
      pool = ApiMakerCommandsPool.current()
    }

    const promiseResult = pool.addCommand(data)

    if (args.instant || useWebsocketRequests) {
      pool.flushRunLast.run()
    } else {
      pool.flushRunLast.queue()
    }

    return promiseResult
  }

  /**
   * Returns the shared command pool instance.
   * @returns {ApiMakerCommandsPool}
   */
  static current() {
    if (!shared.currentApiMakerCommandsPool) shared.currentApiMakerCommandsPool = new ApiMakerCommandsPool()

    return shared.currentApiMakerCommandsPool
  }

  /** Flushes the shared command pool immediately. */
  static flush() {
    ApiMakerCommandsPool.current().flush()
  }

  /** Initializes one command pool instance with empty queued state. */
  constructor() {
    this.flushCount = 0

    /** @type {Record<number, CommandDataType>} */
    this.pool = {}

    /** @type {PoolDataType} */
    this.poolData = {}

    this.currentId = 1

    /** @type {CommandArgumentMap} */
    this.globalRequestData = {}

    /** @type {CommandRequestOptions} */
    this.requestOptions = {}
  }

  /**
   * Adds one command execution to this pool instance.
   * @param {CommandDescriptor} data
   * @returns {ApiMakerCommandExecution}
   */
  addCommand(data) {
    const stack = Error().stack
    const id = this.currentId
    const commandExecution = new ApiMakerCommandExecution()
    const commandType = data.type
    const commandName = data.command
    const collectionName = data.collectionName

    this.currentId += 1
    this.pool[id] = {commandExecution, stack}

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

    return commandExecution
  }

  /** @returns {number} */
  commandsCount() {
    return Object.keys(this.pool).length
  }

  /**
   * @param {object} args
   * @param {string} args.url
   * @param {CommandSubmitData} args.commandSubmitData
   * @param {ApiMakerCommandExecution} [args.commandExecution]
   * @returns {Promise<CommandsRequestResponse>}
   */
  async sendRequest({commandExecution, commandSubmitData, url}) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await this.performRequest({commandExecution, commandSubmitData, url}) // eslint-disable-line no-await-in-loop

      if (response?.success === false && response.type == "invalid_authenticity_token") {
        console.log("Invalid authenticity token - try again")
        await SessionStatusUpdater.current().updateSessionStatus() // eslint-disable-line no-await-in-loop
        continue // eslint-disable-line no-continue
      }

      if (response?.success === false && response.type == "authentication_changed") {
        const recovered = await this.recoverAuthentication() // eslint-disable-line no-await-in-loop

        if (recovered) continue // eslint-disable-line no-continue

        throw new SessionExpiredError()
      }

      return /** @type {CommandsRequestResponse} */ (response)
    }

    throw new Error("Couldnt successfully execute request")
  }

  /**
   * Performs a single command request over websocket or HTTP.
   * @param {object} args
   * @param {string} args.url
   * @param {CommandSubmitData} args.commandSubmitData
   * @param {ApiMakerCommandExecution} [args.commandExecution]
   * @returns {Promise<CommandsRequestResponse>}
   */
  async performRequest({commandExecution, commandSubmitData, url}) {
    if (Config.getWebsocketRequests() && !this.requestOptions.forceHttp && commandSubmitData.getFilesCount() == 0) {
      return /** @type {Promise<CommandsRequestResponse>} */ (WebsocketRequestClient.current().perform({
        cacheResponse: this.requestOptions.cacheResponse,
        global: this.globalDataForRequest(),
        onLog: (message) => commandExecution?.addLog(message),
        onProgress: (progressData) => commandExecution?.setProgress(progressData),
        onReceived: (receivedData) => commandExecution?.setReceived(receivedData),
        request: commandSubmitData.getJsonData()
      }))
    }

    if (commandSubmitData.getFilesCount() > 0) {
      return /** @type {CommandsRequestResponse} */ (await Api.requestLocal({path: url, method: "POST", rawData: commandSubmitData.getFormData()}))
    }

    return /** @type {CommandsRequestResponse} */ (await Api.requestLocal({path: url, method: "POST", data: commandSubmitData.getJsonData()}))
  }

  /**
   * The user ids the frontend believes it is signed in as, keyed by Devise
   * scope. Sent with each request so the backend can detect (and let the
   * frontend recover from) a stale session before running commands. Undefined
   * when nothing is signed in, so genuinely anonymous requests send no belief.
   * @returns {Record<string, number | string> | undefined}
   */
  believedDeviseUserIds() {
    const believed = /** @type {Record<string, number | string>} */ ({})

    for (const scope of Devise.registeredScopes()) {
      const model = Devise.current().getCurrentScope(scope)

      if (model) believed[scope] = /** @type {BaseModelWithId} */ (model).id()
    }

    return Object.keys(believed).length > 0 ? believed : undefined
  }

  /**
   * The global request data merged with the believed signed-in identity.
   * @returns {Record<string, unknown>}
   */
  globalDataForRequest() {
    const believed = this.believedDeviseUserIds()

    if (!believed) return this.globalRequestData

    return {...this.globalRequestData, believed_devise_user_ids: believed}
  }

  /**
   * Recovers from an `authentication_changed` response: refreshes the existing
   * websocket connection's auth in-place from the current server session (no
   * reconnect, no password) and reconciles the local session cache. Returns
   * whether a previously signed-in scope is still authenticated, so the request
   * can be retried; false means the user is genuinely signed out (the sign-in
   * form is shown centrally via the Devise sign-out event).
   * @returns {Promise<boolean>}
   */
  async recoverAuthentication() {
    const sessionStatusUpdater = SessionStatusUpdater.current()
    const sessionStatus = await sessionStatusUpdater.sessionStatus()
    const scopes = Devise.registeredScopes()

    await Promise.all(
      scopes.map((scope) => Devise.refreshWebsocketSession({scope, shadowSessionToken: sessionStatus?.shadow_session_token}))
    )

    sessionStatusUpdater.applyResult(sessionStatus)

    return scopes.some((scope) => Boolean(sessionStatus?.scopes?.[scope]?.signed_in))
  }

  /** Sends the currently queued commands and resolves or rejects their executions. */
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
      const globalData = this.globalDataForRequest()

      if (Object.keys(globalData).length > 0)
        submitData.global = globalData

      const commandSubmitData = new CommandSubmitData(submitData)
      const url = "/api_maker/commands"
      const commandExecution = Object.values(currentPool)[0]?.commandExecution
      const response = await this.sendRequest({commandExecution, commandSubmitData, url})

      await Promise.all(Object.keys(response.responses).map(async(commandId) => {
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
          commandData.commandExecution.resolve(commandResponseData)
        } else if (responseType == "error") {
          this.rejectWithCallerStack(commandData, new CustomError("Command error", {response: commandResponseData}))
        } else if (responseType == "failed") {
          await this.handleFailedResponse(commandData, commandResponseData)
        } else {
          throw new Error(`Unhandled response type: ${responseType}`)
        }
      }))
    } catch (error) {
      // sendRequest (e.g. an unrecoverable SessionExpiredError) or response
      // handling can throw before the per-command promises are settled. Reject
      // every queued command so callers awaiting their execution don't hang
      // forever. Already-settled executions ignore the extra reject.
      for (const commandData of Object.values(currentPool)) {
        commandData.commandExecution.reject(/** @type {Error} */ (error))
      }
    } finally {
      this.flushCount--
    }
  }

  /**
   * @param {CommandDataType} commandData
   * @param {FailedCommandResponseData} commandResponseData
   * @returns {Promise<void>}
   */
  async handleFailedResponse(commandData, commandResponseData) {
    await this.refreshSessionStatusForNoAccessError(commandResponseData)

    let error

    if (commandResponseData.error_type == "destroy_error") {
      error = new DestroyError("Destroy failed", {response: commandResponseData})
    } else if (commandResponseData.error_type == "validation_error") {
      const validationErrors = new ValidationErrors({
        model: digg(commandResponseData, "model"),
        validationErrors: digg(commandResponseData, "validation_errors")
      })
      error = new ValidationError(validationErrors, {response: commandResponseData})

      events.emit("onValidationErrors", validationErrors)
    } else {
      const errorMessage = commandResponseData.errors ? undefined : "Command failed"

      error = new CustomError(errorMessage, {response: commandResponseData})
    }

    this.rejectWithCallerStack(commandData, error)
  }

  /**
   * Rejects the command with the given error, splicing the caller's stack (captured synchronously in addCommand) onto error.stack.
   * Needed because error.stack is frozen at construction time inside flush()'s microtask and therefore loses the caller's frames.
   * @param {CommandDataType} commandData
   * @param {Error} error
   * @returns {void}
   */
  rejectWithCallerStack(commandData, error) {
    if (commandData.stack) {
      // V8 prefixes "Error\n" as a header; JSC/SpiderMonkey stacks start directly with a frame.
      const callerFrames = commandData.stack.startsWith("Error")
        ? commandData.stack
          .split("\n")
          .slice(1)
          .join("\n")
        : commandData.stack

      if (callerFrames) {
        error.stack = `${error.stack ?? ""}\n${callerFrames}`
      }
    }

    commandData.commandExecution.reject(error)
  }

  /**
   * @param {FailedCommandResponseData} commandResponseData
   * @returns {Promise<void>}
   */
  async refreshSessionStatusForNoAccessError(commandResponseData) {
    if (commandResponseData.error_type != "not_found_or_no_access") {
      return
    }

    const signedInScope = Devise
      .registeredScopes()
      .find((scope) => Devise.current().hasCurrentScope(scope) || Devise.current().hasGlobalCurrentScope(scope))

    if (!signedInScope) {
      return
    }

    await SessionStatusUpdater.current().updateSessionStatus()
  }

  /**
   * Returns true while one or more flushes are still in progress.
   * @returns {boolean}
   */
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
