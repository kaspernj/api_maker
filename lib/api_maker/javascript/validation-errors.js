export default class ApiMakerValidationErrors {
  constructor(args) {
    this.model = args.model
    this.response = args.response
  }

  getValidationErrorsForModel(model) {
    throw new Error("stub")
  }
}
