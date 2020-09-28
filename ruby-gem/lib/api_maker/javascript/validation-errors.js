import {digg, digs} from "@kaspernj/object-digger"

const inflection = require("inflection")

export class ValidationError {
  constructor(args) {
    this.attributeName = digg(args, "attribute_name")
    this.attributeType = digg(args, "attribute_type")
    this.errorMessage = digg(args, "error_message")
    this.errorType = digg(args, "error_type")
    this.inputName = args.input_name
    this.handled = false
    this.modelName = digg(args, "model_name")
  }

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

  getAttributeName() {
    return digg(this, "attributeName")
  }

  getErrorMessage() {
    return digg(this, "errorMessage")
  }

  getFullErrorMessage() {
    const {attributeType} = digs(this, "attributeType")

    if (attributeType == "base") {
      return this.getErrorMessage()
    } else {
      const attributeHumanName = this.getModelClass().humanAttributeName(this.getAttributeName())
      return `${attributeHumanName} ${this.getErrorMessage()}`
    }
  }

  getHandled() {
    return digg(this, "handled")
  }

  getInputName() {
    return digg(this, "inputName")
  }

  getModelClass() {
    const modelName = inflection.classify(digg(this, "modelName"))

    return digg(require("api-maker/models"), modelName)
  }

  setHandled() {
    this.handled = true
  }
}

export class ValidationErrors {
  constructor(args) {
    this.rootModel = digg(args, "model")
    this.validationErrors = digg(args, "validationErrors").map(validationError => new ValidationError(validationError))
  }

  getErrorMessage() {
    return this.validationErrors.map(validationError => validationError.getFullErrorMessage()).join(". ")
  }

  getValidationErrors() {
    return this.validationErrors
  }

  getValidationErrorsForInput(args) {
    const {attributeName, inputName, onMatchValidationError} = args
    const validationErrors = this.validationErrors.filter((validationError) => {
      if (onMatchValidationError) {
        return onMatchValidationError(validationError)
      } else {
        return validationError.matchesAttributeAndInputName(attributeName, inputName, onMatchValidationError)
      }
    })

    validationErrors.map((validationError) => validationError.setHandled())

    return validationErrors
  }

  getUnhandledErrorMessage() {
    const unhandledValidationErrors = this.validationErrors.filter(validationError => !validationError.getHandled())

    if (unhandledValidationErrors.length > 0)
      return unhandledValidationErrors.map(validationError => validationError.getFullErrorMessage()).join(". ")
  }
}
