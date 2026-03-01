import CustomError from "./custom-error.js"

/** Destroy command error. */
class DestroyError extends CustomError {}

DestroyError.apiMakerType = "DestroyError"

export default DestroyError
