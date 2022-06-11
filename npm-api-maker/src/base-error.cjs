const {dig, digg} = require("diggerize")
const errorMessages = require("./error-messages.cjs")

class BaseError extends Error {
  constructor (message, args = {}) {
    let messageToUse = message

    if (typeof args.response == "object" && dig(args, "response", "errors")) {
      messageToUse = `${messageToUse}: ${errorMessages(args).join(". ")}`
    }

    super(messageToUse)
    this.args = args

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, BaseError)
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

BaseError.apiMakerType = "BaseError"

module.exports = BaseError
