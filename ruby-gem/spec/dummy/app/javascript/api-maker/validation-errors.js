import {digg, digs} from "@kaspernj/object-digger"

const inflection = require("inflection")

export class ValidationError {
  constructor(args) {
    this.attributeName = digg(args, "attribute_name")
    this.attributeType = digg(args, "attribute_type")
    this.errorMessages = digg(args, "error_messages")
    this.errorTypes = digg(args, "error_types")
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

  getErrorMessages() {
    return digg(this, "errorMessages")
  }

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
    const fullErrorMessages = []

    for (const validationError of this.validationErrors) {
      for (const fullErrorMessage of validationError.getFullErrorMessages()) {
        fullErrorMessages.push(fullErrorMessage)
      }
    }

    return fullErrorMessages.join(". ")
  }

  getValidationErrors() {
    return this.validationErrors
  }

  getValidationErrorsForInput(args) {
    const {attribute, inputName, onMatchValidationError} = args
    const validationErrors = this.validationErrors.filter((validationError) => {
      if (onMatchValidationError) {
        return onMatchValidationError(validationError)
      } else {
        return validationError.matchesAttributeAndInputName(attribute, inputName, onMatchValidationError)
      }
    })

    validationErrors.map((validationError) => validationError.setHandled())

    return validationErrors
  }

  getUnhandledErrorMessage() {
    const unhandledValidationErrors = this.validationErrors.filter(validationError => !validationError.getHandled())

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
