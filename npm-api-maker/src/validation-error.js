export default class ValidationError extends Error {
  constructor(validationErrors) {
    super(validationErrors.getUnhandledErrorMessage() || validationErrors.getErrorMessage())
    this.validationErrors = validationErrors
  }

  hasUnhandledErrors() {
    const unhandledError = this.validationErrors.getValidationErrors().find(validationError => !validationError.getHandled())
    return Boolean(unhandledError)
  }
}
