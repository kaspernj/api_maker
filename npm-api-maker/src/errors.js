import {dig, digg} from "@kaspernj/object-digger"

function errorMessages(args) {
  return digg(args, "response", "errors").map((error) => {
    if (typeof error == "string") {
      return error
    }

    return digg(error, "message")
  })
}

export class CustomError extends Error {
  constructor(message, args = {}) {
    if (dig(args, "response", "errors")) {
      message = `${message}: ${errorMessages(args).join(". ")}`
    }

    super(message)
    this.args = args

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, CustomError)
  }

  errorMessages() {
    return errorMessages(this.args)
  }

  errorTypes() {
    return digg(this, "args", "response", "errors").map((error) => digg(error, "type"))
  }
}

export class ValidationError extends Error {
  constructor(validationErrors) {
    super(validationErrors.getUnhandledErrorMessage() || validationErrors.getErrorMessage())
    this.validationErrors = validationErrors
  }

  hasUnhandledErrors() {
    const unhandledError = this.validationErrors.getValidationErrors().find(validationError => !validationError.getHandled())
    return Boolean(unhandledError)
  }
}
