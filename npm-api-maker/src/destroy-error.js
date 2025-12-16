import CustomError from "./custom-error.js"

class DestroyError extends CustomError {}

DestroyError.apiMakerType = "DestroyError"

export default DestroyError
