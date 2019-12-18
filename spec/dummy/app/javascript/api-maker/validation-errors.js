export default class ApiMakerValidationErrors {
  constructor(args) {
    this.rootModel = args.model
    this.validationErrors = args.validationErrors

    if (!this.validationErrors) throw new Error("Requires validation errors")
  }

  getValidationErrorsForModel(args) {
    const { attribute, model, uniqueKey } = args
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

    const validationErrorsForAttribute = errorInstance.attributes[attribute]
    if (!validationErrorsForAttribute) return []

    return validationErrorsForAttribute
  }
}
