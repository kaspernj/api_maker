const inflection = require("inflection")

export default class ApiMakerValidationErrors {
  constructor(args) {
    this.rootModel = args.model
    this.validationErrors = args.validationErrors

    if (!this.validationErrors) throw new Error("Requires validation errors")
  }

  getValidationErrorsForName(attribute, inputName) {
    let validationErrors = this.validationErrors[inputName] && this.validationErrors[inputName].errors || []

    if (attribute) {
      const validationErrorsForRelationship = this.getValidationErrrorsForRelationship(attribute, inputName)

      if (validationErrorsForRelationship)
        validationErrors = validationErrors.concat(validationErrorsForRelationship)
    }

    return validationErrors
  }

  getValidationErrrorsForRelationship(attribute, inputName) {
    const attributeNameIdMatch = attribute.match(/^(.+)Id$/)

    // A relationship column ends with "_id". We should try for validation errors on an attribute without the "_id" as well
    if (!attributeNameIdMatch) return

    const attributeUnderScoreName = inflection.underscore(attribute)
    const attributeNameWithoutId = attributeNameIdMatch[1]
    const inputNameWithoutId = inputName.replace(`[${attributeUnderScoreName}]`, `[${attributeNameWithoutId}]`)

    return this.validationErrors[inputNameWithoutId] && this.validationErrors[inputNameWithoutId].errors || []
  }
}
