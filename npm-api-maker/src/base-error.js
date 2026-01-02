// @ts-check

import {dig, digg} from "diggerize"
import errorMessages from "./error-messages.js"

/**
 * @typedef {object} BaseErrorArgsType
 * @property {boolean} [addResponseErrorsToErrorMessage]
 * @property {import("./base-model.js").default} [model]
 * @property {object} response
 * @property {string[]} [response.validation_errors]
 * @property {import("./error-messages.js").ErrorMessagesArgsType} [response.errors]
 */

export default class BaseError extends Error {
  static apiMakerType = "BaseError"
  apiMakerType = "BaseError"

  /**
   * @param {string} message
   * @param {BaseErrorArgsType} [args]
   */
  constructor(message, args) {
    let messageToUse = message

    if (args && "addResponseErrorsToErrorMessage" in args && !args.addResponseErrorsToErrorMessage) {
      messageToUse = message
    } else {
      if (typeof args.response == "object" && dig(args, "response", "errors")) { // eslint-disable-line no-lonely-if
        if (message) {
          messageToUse = `${messageToUse}: ${errorMessages(args).join(". ")}`
        } else {
          messageToUse = errorMessages(args).join(". ")
        }
      }
    }

    super(messageToUse)
    this.args = args

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) Error.captureStackTrace(this, BaseError)
  }

  /** @returns {string[]} */
  errorMessages() {
    return errorMessages(this.args)
  }

  /** @returns {string[]} */
  errorTypes() {
    if (typeof this.args.response == "object") {
      return digg(this, "args", "response", "errors").map((error) => digg(error, "type"))
    }
  }
}
