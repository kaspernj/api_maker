export default class ApiMakerCustomError extends Error {
  constructor(message, args = {}) {
    if (args.response && args.response.errors)
      message = `${message}: ${args.response.errors.join(". ")}`

    super(message)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, ApiMakerCustomError)

    this.args = args
  }
}
