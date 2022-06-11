const {dig, digg} = require("diggerize")

const errorMessages = (args) => {
  if (typeof args.response == "object") {
    return digg(args, "response", "errors").map((error) => {
      if (typeof error == "string") {
        return error
      }

      return digg(error, "message")
    })
  }
}

class CustomError extends Error {
  constructor (message, args = {}) {
    let messageToUse = message

    if (typeof args.response == "object" && dig(args, "response", "errors")) {
      messageToUse = `${messageToUse}: ${errorMessages(args).join(". ")}`
    }

    super(messageToUse)
    this.args = args

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, CustomError)
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

CustomError.apiMakerType = "CustomError"

module.exports = CustomError
