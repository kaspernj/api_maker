const CustomError = require("./custom-error.cjs")
const {dig, digg} = require("@kaspernj/object-digger")
const inflection = require("inflection")

module.exports = class CustomValidationError extends CustomError {
  constructor(message, args) {
    super(message, args)
    this.validationErrors = digg(args, "response", "validation_errors")
  }

  hasValidationErrorForAttribute(attributeName) {
    const underscoredAttributeName = inflection.underscore(attributeName)
    const foundAttribute = this.validationErrors.find((validationError) => digg(validationError, "attribute_name") == underscoredAttributeName)

    if (foundAttribute) {
      return true
    }

    return false
  }
}
