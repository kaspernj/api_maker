const inflection = require("inflection")

export default class ApiMakerValidationErrors {
  constructor(args) {
    this.rootModel = args.model
    this.validationErrors = args.validationErrors

    if (!this.validationErrors) throw new Error("Requires validation errors")
  }

  getValidationErrorsForModel(args) {
    const { attribute, model, uniqueKey } = args
    const attributeName = inflection.underscore(attribute)
    const validationErrorsForModelClass = this.validationErrors[model.modelClassData().collectionName]

    if (!validationErrorsForModelClass) return []

    const errorInstance = validationErrorsForModelClass.find(instance => {
      if (model.isPersisted() && instance.id == model.id()) {
        return true
      } else if (instance.finder == "unique-key" && instance.finder_value == uniqueKey) {
        return true
      } else if (instance.finder == "root" && model == this.rootModel) {
        return true
      }
    })

    if (!errorInstance) return []
    let errorMessages = this.getValidationErrorsForAttribute(attributeName, errorInstance)

    if (errorMessages.length == 0) {
      const match = attributeName.match(/^(.+)_id$/)

      if (match) {
        const attributeNameWithoutId = match[1]
        errorMessages = this.getValidationErrorsForAttribute(attributeNameWithoutId, errorInstance)
      }
    }

    return errorMessages
  }

  getValidationErrorsForAttribute(attributeName, errorInstance) {
    const validationErrorsForAttribute = errorInstance.attributes[attributeName]
    if (!validationErrorsForAttribute) return []

    return validationErrorsForAttribute
  }
}
