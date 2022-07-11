import BaseError from "./base-error.mjs"

class CustomError extends BaseError {}

CustomError.apiMakerType = "CustomError"

export default CustomError
