import CustomError from "./custom-error"

class DestroyError extends CustomError {}

DestroyError.apiMakerType = "DestroyError"

export default DestroyError
