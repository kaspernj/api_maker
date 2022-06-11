const BaseError = require("./base-error.cjs")

class DestroyError extends BaseError {}

DestroyError.apiMakerType = "DestroyError"

module.exports = DestroyError
