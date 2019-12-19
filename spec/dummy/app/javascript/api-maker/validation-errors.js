const inflection = require("inflection")

export class ValidationError {
  constructor(args) {
    this.attributeName = args.attribute_name
    this.errorMessage = args.error_message
    this.errorType = args.error_type
    this.inputName = args.input_name
    this.handled = false
    this.modelName = args.model_name
  }

  matchesAttributeAndInputName(attributeName, inputName) {
    if (this.getInputName() == inputName) return true

    const attributeNameIdMatch = attributeName.match(/^(.+)Id$/)

    // A relationship column ends with "_id". We should try for validation errors on an attribute without the "_id" as well
    if (!attributeNameIdMatch) return false

    const attributeUnderScoreName = inflection.underscore(attributeName)
    const attributeNameWithoutId = attributeNameIdMatch[1]
    const inputNameWithoutId = inputName.replace(`[${attributeUnderScoreName}]`, `[${attributeNameWithoutId}]`)

    if (this.getInputName() == inputNameWithoutId) return true

    return false
  }

  getAttributeName() {
    return this.attributeName
  }

  getErrorMessage() {
    return this.errorMessage
  }

  getFullErrorMessage() {
    const attributeHumanName = this.getModelClass().humanAttributeName(this.getAttributeName())
    return `${attributeHumanName} ${this.getErrorMessage()}`
  }

  getHandled() {
    return this.handled
  }

  getInputName() {
    return this.inputName
  }

  getModelClass() {
    const modelFileName = inflection.dasherize(this.modelName)
    const modelClass = require(`api-maker/models/${modelFileName}`).default
    return modelClass
  }

  setHandled() {
    this.handled = true
  }
}

export class ValidationErrors {
  constructor(args) {
    this.rootModel = args.model
    this.validationErrors = args.validationErrors.map(validationError => new ValidationError(validationError))
  }

  getErrorMessage() {
    return this.validationErrors.map(validationError => validationError.getFullErrorMessage()).join(". ")
  }

  getValidationErrors(attributeName, inputName) {
    const validationErrors = this.validationErrors.filter(validationError => validationError.matchesAttributeAndInputName(attributeName, inputName))
    validationErrors.map(validationError => validationError.setHandled())
    return validationErrors
  }

  getUnhandledErrorMessage() {
    const unhandledValidationErrors = this.validationErrors.filter(validationError => !validationError.getHandled())

    if (unhandledValidationErrors.length > 0)
      return unhandledValidationErrors.map(validationError => validationError.getFullErrorMessage()).join(". ")
  }
}
