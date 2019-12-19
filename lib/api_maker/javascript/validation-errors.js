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
    console.log("Matches", inputName, this.getInputName())

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

  getValidationErrors() {
    return this.validationErrors
  }

  getValidationErrorsForInput(attributeName, inputName) {
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
