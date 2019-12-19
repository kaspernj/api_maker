const inflection = require("inflection")

export default class ApiMakerValidationErrors {
  constructor(args) {
    this.rootModel = args.model
    this.validationErrors = args.validationErrors

    if (!this.validationErrors) throw new Error("Requires validation errors")
  }

  getValidationErrorsForName(name) {
    const validationErrorsForName = this.validationErrors[name]
    if (!validationErrorsForName) return []

    return validationErrorsForName.errors
  }

  getValidationErrorsForAttribute(attributeName, errorInstance) {
    const validationErrorsForAttribute = errorInstance.attributes[attributeName]
    if (!validationErrorsForAttribute) return []

    return validationErrorsForAttribute
  }
}
