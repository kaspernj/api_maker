const CustomError = require("./custom-error.cjs")
const {digg} = require("@kaspernj/object-digger")

module.exports = class ValidationError extends CustomError {
  constructor(validationErrors, args) {
    super(validationErrors.getUnhandledErrorMessage() || validationErrors.getErrorMessage(), args)
    this.validationErrors = validationErrors
  }

  hasUnhandledErrors() {
    const unhandledError = this.validationErrors.getValidationErrors().find(validationError => !validationError.getHandled())
    return Boolean(unhandledError)
  }

  hasValidationErrorForAttribute(attributeName) {
    const foundAttribute = this.validationErrors.getValidationErrors().find((validationError) => validationError.getAttributeName() == attributeName)

    if (foundAttribute) {
      return true
    }

    return false
  }
}
