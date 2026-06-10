// @ts-check

/**
 * Raised by the commands pool when a request could not run because the session
 * had expired (the frontend's believed user diverged from the backend's actual
 * user) and could not be renewed. Callers can treat this as a benign "please
 * sign in again" signal — the sign-in form is shown centrally via the Devise
 * sign-out event — rather than a real command failure.
 */
export default class ApiMakerSessionExpiredError extends Error {
  static apiMakerType = "SessionExpiredError"
  apiMakerType = "SessionExpiredError"

  /** @param {string} [message] */
  constructor(message = "The session has expired") {
    super(message)

    if (Error.captureStackTrace) Error.captureStackTrace(this, ApiMakerSessionExpiredError)
  }
}
