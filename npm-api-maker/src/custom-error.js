import BaseError from "./base-error.js"

/** Custom API Maker error. */
class CustomError extends BaseError {}

CustomError.apiMakerType = "CustomError"

export default CustomError
