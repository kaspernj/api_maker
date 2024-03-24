import BaseError from "./base-error.mjs"
import * as inflection from "inflection"

class ValidationError extends BaseError {
  constructor(validationErrors, args) {
    const errorMessage = validationErrors.getUnhandledErrorMessage() || validationErrors.getErrorMessage()
    const forwardedArgs = {addResponseErrorsToErrorMessage: false}
    const newArgs = Object.assign({}, args, forwardedArgs)

    super(errorMessage, newArgs)
    this.validationErrors = validationErrors
  }

  hasUnhandledErrors() {
    const unhandledError = this.validationErrors.getValidationErrors().find((validationError) => !validationError.getHandled())

    return Boolean(unhandledError)
  }

  hasValidationErrorForAttribute(attributeName) {
    const underscoredAttributeName = inflection.underscore(attributeName)
    const foundAttribute = this.validationErrors.getValidationErrors().find((validationError) => validationError.getAttributeName() == underscoredAttributeName)

    if (foundAttribute) return true

    return false
  }
}

ValidationError.apiMakerType = "ValidationError"

export default ValidationError
