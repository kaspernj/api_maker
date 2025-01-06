import {dig, digg} from "diggerize"
import errorMessages from "./error-messages"

export default class BaseError extends Error {
  static apiMakerType = "BaseError"

  constructor (message, args = {}) {
    let messageToUse = message

    if ("addResponseErrorsToErrorMessage" in args && !args.addResponseErrorsToErrorMessage) {
      messageToUse = message
    } else {
      if (typeof args.response == "object" && dig(args, "response", "errors")) {
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

  errorMessages () {
    return errorMessages(this.args)
  }

  errorTypes () {
    if (typeof this.args.response == "object") {
      return digg(this, "args", "response", "errors").map((error) => digg(error, "type"))
    }
  }
}
