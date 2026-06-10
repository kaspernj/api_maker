// @ts-check
import * as inflection from "inflection"
import Devise from "./devise.js"
import Logger from "./logger.js"
import config from "./config.js"
import wakeEvent from "wake-event"

const logger = new Logger({name: "ApiMaker / SessionStatusUpdater"})
const shared = {}

// logger.setDebug(true)

/**
 * @typedef {object} SessionStatusScope
 * @property {boolean} signed_in
 */

/**
 * @typedef {object} SessionStatusResult
 * @property {string} [csrf_token]
 * @property {Record<string, SessionStatusScope>} scopes
 * @property {string} [shadow_session_token]
 */

/**
 * @typedef {object} SessionStatusUpdaterArgs
 * @property {number} [timeout]
 * @property {boolean} [useMetaElement]
 */

/** Tracks session and CSRF token freshness. */
export default class ApiMakerSessionStatusUpdater {
  /**
   * Returns the shared session-status updater instance.
   * @param {SessionStatusUpdaterArgs} [args]
   * @returns {ApiMakerSessionStatusUpdater}
   */
  static current(args) {
    if (!shared.apiMakerSessionStatusUpdater) {
      shared.apiMakerSessionStatusUpdater = new ApiMakerSessionStatusUpdater(args)
    }

    return shared.apiMakerSessionStatusUpdater
  }

  /**
   * Sets up session-status polling and browser wake/online listeners.
   * @param {SessionStatusUpdaterArgs} [args]
   */
  constructor(args = {}) {
    this.events = {}
    this.timeout = args.timeout || 600000

    if ("useMetaElement" in args) {
      this.useMetaElement = args.useMetaElement
    } else if (typeof document === "undefined") {
      this.useMetaElement = false
    } else {
      this.useMetaElement = true
    }

    if (typeof window != "undefined") {
      this.connectOnlineEvent()
    }

    if (typeof document != "undefined") {
      this.connectVisibilityEvents()
    }

    this.connectWakeEvent()
  }

  /** Re-checks session state when the browser comes back online. */
  connectOnlineEvent() {
    window.addEventListener("online", this.updateSessionStatus, false)
  }

  /** Re-checks session state when the device wakes from sleep. */
  connectWakeEvent() {
    wakeEvent(this.updateSessionStatus)
  }

  /**
   * Re-checks session state when the user returns to a backgrounded tab/app.
   * The `wake-event` package only fires on multi-second device-sleep drift, so
   * it misses iOS Safari tab suspension; visibilitychange/focus/pageshow cover
   * that, surfacing an expired session the moment the user returns.
   */
  connectVisibilityEvents() {
    document.addEventListener("visibilitychange", this.refreshOnReturnToForeground, false)

    if (typeof window != "undefined") {
      window.addEventListener("focus", this.refreshOnReturnToForeground, false)
      window.addEventListener("pageshow", this.refreshOnReturnToForeground, false)
    }
  }

  /**
   * Schedules a debounced session-status refresh when the page becomes visible
   * again. visibilitychange, focus and pageshow can fire together on return, so
   * the refresh is collapsed into a single request.
   */
  refreshOnReturnToForeground = () => {
    if (typeof document != "undefined" && document.visibilityState && document.visibilityState != "visible") {
      return
    }

    if (this.returnRefreshTimeout) return

    this.returnRefreshTimeout = setTimeout(() => {
      this.returnRefreshTimeout = undefined
      this.updateSessionStatus()
    }, 50)
  }

  async getCsrfToken() {
    if (this.csrfToken) {
      logger.debug(`Get CSRF token from set variable: ${this.csrfToken}`)

      return this.csrfToken
    }

    if (this.useMetaElement) {
      const csrfTokenElement = document.querySelector("meta[name='csrf-token']")

      if (csrfTokenElement) {
        logger.debug(() => `Get CSRF token from meta element: ${csrfTokenElement.getAttribute("content")}`)

        this.csrfToken = csrfTokenElement.getAttribute("content")

        return this.csrfToken
      }
    }

    logger.debug("Updating session status because no CSRF token set yet")
    await this.updateSessionStatus()

    if (this.csrfToken) {
      logger.debug(() => `Returning CSRF token after updating session status: ${this.csrfToken}`)

      return this.csrfToken
    }

    logger.debug("No CSRF token available after updating session status")

    return undefined
  }

  /**
   * Requests the latest backend session-status payload.
   * @returns {Promise<SessionStatusResult>}
   */
  sessionStatus() {
    return new Promise((resolve) => {
      const host = config.getHost()
      let requestPath = ""

      if (host) requestPath += host

      requestPath += "/api_maker/session_statuses"

      const xhr = new XMLHttpRequest()
      xhr.open("POST", requestPath, true)
      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText)
        resolve(response)
      }
      xhr.send()
    })
  }

  /**
   * Registers a callback for frontend sign-out detection.
   * @param {Function} callback
   */
  onSignedOut(callback) {
    // @ts-expect-error
    this.addEvent("onSignedOut", callback)
  }

  /** Starts or refreshes the periodic session-status timer. */
  startTimeout() {
    logger.debug("startTimeout")

    if (this.updateTimeout)
      clearTimeout(this.updateTimeout)

    this.updateTimeout = setTimeout(
      () => {
        this.startTimeout()
        this.updateSessionStatus()
      },
      this.timeout
    )
  }

  /** Stops the periodic session-status timer if it is running. */
  stopTimeout() {
    if (this.updateTimeout)
      clearTimeout(this.updateTimeout)
  }

  /** Fetches the latest session status and applies it locally. */
  updateSessionStatus = async () => {
    logger.debug("updateSessionStatus")

    const result = await this.sessionStatus()

    this.applyResult(result)
  }

  /**
   * @param {SessionStatusResult} result
   * @returns {void}
   */
  applyResult(result) {
    logger.debug(() => `Result: ${JSON.stringify(result, null, 2)}`)

    this.updateMetaElementsFromResult(result)
    this.updateUserSessionsFromResult(result)
  }

  /**
   * Updates the cached and DOM CSRF token from one session-status response.
   * @param {SessionStatusResult} result
   */
  updateMetaElementsFromResult(result) {
    logger.debug("updateMetaElementsFromResult")

    if (!result.csrf_token) {
      return
    }

    this.csrfToken = result.csrf_token

    if (this.useMetaElement) {
      const csrfTokenElement = document.querySelector("meta[name='csrf-token']")

      if (csrfTokenElement) {
        logger.debug(() => `Changing token from "${csrfTokenElement.getAttribute("content")}" to "${result.csrf_token}"`)
        csrfTokenElement.setAttribute("content", result.csrf_token)
      } else {
        logger.debug("csrf token element couldn't be found")
      }
    }
  }

  /**
   * Applies each returned scope status to the frontend Devise cache.
   * @param {SessionStatusResult} result
   */
  updateUserSessionsFromResult(result) {
    for (const scopeName in result.scopes) {
      this.updateUserSessionScopeFromResult(scopeName, result.scopes[scopeName])
    }
  }

  /**
   * Applies one scope's signed-in state to the frontend Devise cache.
   * @param {string} scopeName
   * @param {SessionStatusScope} scope
   */
  updateUserSessionScopeFromResult(scopeName, scope) {
    const deviseIsSignedInMethodName = `is${inflection.camelize(scopeName)}SignedIn`

    if (!(deviseIsSignedInMethodName in Devise)) {
      throw new Error(`No such method in Devise: ${deviseIsSignedInMethodName}`)
    }

    const currentlySignedIn = Devise[deviseIsSignedInMethodName]()
    const signedInOnBackend = scope.signed_in

    if (currentlySignedIn && !signedInOnBackend) {
      logger.debug(() => `${inflection.camelize(scopeName)} signed in on frontend but not in backend!`)

      Devise.setSignedOut({scope: scopeName})
      Devise.callSignOutEvent({scope: scopeName})
    }
  }
}
