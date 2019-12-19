export default class ApiMakerValidationError extends Error {
  constructor(validationErrors) {
    super(validationErrors.getUnhandledErrorMessage())
  }
}
