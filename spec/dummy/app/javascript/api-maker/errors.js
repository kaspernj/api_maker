export class CustomError extends Error {
  constructor(message, args = {}) {
    if (args.response && args.response.errors)
      message = `${message}: ${args.response.errors.join(". ")}`

    super(message)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, CustomError)

    this.args = args
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
