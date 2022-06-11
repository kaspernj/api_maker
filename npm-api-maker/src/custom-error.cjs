const BaseError = require("./base-error.cjs")

class CustomError extends BaseError {}

CustomError.apiMakerType = "CustomError"

module.exports = CustomError
