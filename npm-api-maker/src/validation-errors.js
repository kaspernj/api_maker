// @ts-check

import * as inflection from "inflection"
import {digg, digs} from "diggerize"
import modelClassRequire from "./model-class-require.js"

/**
 * @typedef {object} ValidationErrorEntryArgs
 * @property {string} attribute_name
 * @property {string} attribute_type
 * @property {string[]} error_messages
 * @property {string[]} error_types
 * @property {string} input_name
 * @property {string} model_name
 * @typedef {object} ValidationErrorsArgs
 * @property {object} model
 * @property {ValidationErrorEntryArgs[]} validationErrors
 * @typedef {object} ValidationInputMatchArgs
 * @property {string} [attribute]
 * @property {string} [inputName]
 * @property {(validationError: ValidationError) => boolean} [onMatchValidationError]
 */

/** Wraps one backend validation error entry with matching helpers for inputs. */
class ValidationError { // eslint-disable-line padded-blocks

  /**
   * @param {object} args
   * @param {string} args.attribute_name
   * @param {string} args.attribute_type
   * @param {string[]} args.error_messages
   * @param {string} args.input_name
   * @param {string} args.model_name
   */
  constructor(args) {
    this.attributeName = digg(args, "attribute_name")
    this.attributeType = digg(args, "attribute_type")
    this.errorMessages = digg(args, "error_messages")
    this.errorTypes = digg(args, "error_types")
    this.inputName = args.input_name
    this.handled = false
    this.modelName = digg(args, "model_name")
  }

  /**
   * @param {string} attributeName
   * @param {string} inputName
   * @returns {boolean}
   */
  matchesAttributeAndInputName(attributeName, inputName) {
    if (this.getInputName() == inputName) return true
    if (!attributeName) return false

    // A relationship column ends with "_id". We should try for validation errors on an attribute without the "_id" as well
    const attributeNameIdMatch = attributeName.match(/^(.+)Id$/)
    if (!attributeNameIdMatch) return false

    const attributeNameWithoutId = inflection.underscore(attributeNameIdMatch[1])
    const attributeUnderScoreName = inflection.underscore(attributeName)
    const inputNameWithoutId = inputName.replace(`[${attributeUnderScoreName}]`, `[${attributeNameWithoutId}]`)

    if (this.getInputName() == inputNameWithoutId) return true

    return false
  }

  /** @returns {string} */
  getAttributeName = () => digg(this, "attributeName")

  /** @returns {string[]} */
  getErrorMessages = () => digg(this, "errorMessages")

  /** @returns {string[]} */
  getFullErrorMessages() {
    const {attributeType} = digs(this, "attributeType")

    if (attributeType == "base") {
      return this.getErrorMessages()
    } else {
      const fullErrorMessages = []

      for (const errorMessage of this.getErrorMessages()) {
        const attributeHumanName = this.getModelClass().humanAttributeName(this.getAttributeName())
        fullErrorMessages.push(`${attributeHumanName} ${errorMessage}`)
      }

      return fullErrorMessages
    }
  }

  /** @returns {string} */
  getHandled = () => digg(this, "handled")

  /** @returns {string} */
  getInputName = () => digg(this, "inputName")

  /** @returns {typeof import("./base-model.js").default} */
  getModelClass() {
    const modelName = inflection.classify(digg(this, "modelName"))

    return modelClassRequire(modelName)
  }

  /** @returns {void} */
  setHandled() {
    this.handled = true
  }
}

/** Wraps a backend validation-error response and exposes grouped helper methods. */
class ValidationErrors {
  /**
   * Creates a validation-error collection from one backend command response.
   * @param {ValidationErrorsArgs} args
   */
  constructor(args) {
    this.rootModel = digg(args, "model")
    this.validationErrors = digg(args, "validationErrors").map((validationError) => new ValidationError(validationError))
  }

  /**
   * Returns one combined error message string for every validation error.
   * @returns {string}
   */
  getErrorMessage() {
    const fullErrorMessages = []

    for (const validationError of this.validationErrors) {
      for (const fullErrorMessage of validationError.getFullErrorMessages()) {
        fullErrorMessages.push(fullErrorMessage)
      }
    }

    return fullErrorMessages.join(". ")
  }

  /** @returns {ValidationError[]} */
  getValidationErrors = () => this.validationErrors

  /**
   * Returns and marks the validation errors that match one input or custom matcher.
   * @param {ValidationInputMatchArgs} root0
   * @returns {ValidationError[]}
   */
  getValidationErrorsForInput({attribute, inputName, onMatchValidationError}) {
    const validationErrors = this.validationErrors.filter((validationError) => {
      if (onMatchValidationError) {
        return onMatchValidationError(validationError)
      } else {
        return validationError.matchesAttributeAndInputName(attribute, inputName)
      }
    })

    validationErrors.map((validationError) => validationError.setHandled())

    return validationErrors
  }

  /**
   * Returns one combined message for validation errors that were never matched to an input.
   * @returns {string | undefined}
   */
  getUnhandledErrorMessage() {
    const unhandledValidationErrors = this.validationErrors.filter((validationError) => !validationError.getHandled())

    if (unhandledValidationErrors.length > 0) {
      const unhandledValidationErrorMessages = []

      for (const unhandledValidationError of unhandledValidationErrors) {
        for (const errorMessage of unhandledValidationError.getFullErrorMessages()) {
          unhandledValidationErrorMessages.push(errorMessage)
        }
      }

      return unhandledValidationErrorMessages.join(". ")
    }
  }
}

export {
  ValidationError,
  ValidationErrors
}
