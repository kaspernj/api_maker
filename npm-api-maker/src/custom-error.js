import BaseError from "./base-error.js"

class CustomError extends BaseError {}

CustomError.apiMakerType = "CustomError"

export default CustomError
