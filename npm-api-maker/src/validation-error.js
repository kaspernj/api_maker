// @ts-check

/* eslint-disable prefer-object-spread, sort-imports */
import BaseError from "./base-error.js"
import {digg} from "diggerize"
import * as inflection from "inflection"

/** ValidationError. */
export default class ValidationError extends BaseError {
  static apiMakerType = "ValidationError"
  apiMakerType = "ValidationError"

  /**
   * @param {import("./validation-errors.js").ValidationErrors} validationErrors
   * @param {object} args
   */
  constructor(validationErrors, args) {
    const errorMessage = validationErrors.getUnhandledErrorMessage() || validationErrors.getErrorMessage()
    const forwardedArgs = {addResponseErrorsToErrorMessage: false}
    const newArgs = Object.assign({}, args, forwardedArgs)

    super(errorMessage, newArgs)
    this.validationErrors = validationErrors
  }

  /** @returns {import("./validation-errors.js").ValidationError[]} */
  getUnhandledErrors = () => this.validationErrors.getValidationErrors().filter((validationError) => !validationError.getHandled())

  /** @returns {import("./validation-errors.js").ValidationErrors} */
  getValidationErrors = () => digg(this, "validationErrors")

  /** @returns {boolean} */
  hasUnhandledErrors = () => {
    const unhandledError = this.validationErrors.getValidationErrors().find((validationError) => !validationError.getHandled())

    return Boolean(unhandledError)
  }

  /** @returns {boolean} */
  hasValidationErrorForAttribute = (attributeName) => {
    const underscoredAttributeName = inflection.underscore(attributeName)
    const foundAttribute = this.validationErrors.getValidationErrors().find((validationError) => validationError.getAttributeName() == underscoredAttributeName)

    if (foundAttribute) return true

    return false
  }
}
