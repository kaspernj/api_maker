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
 */

/**
 * @typedef {object} SessionStatusUpdaterArgs
 * @property {number} [timeout]
 * @property {boolean} [useMetaElement]
 */

/** Tracks session and CSRF token freshness. */
export default class ApiMakerSessionStatusUpdater {
  /**
   * current.
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
   * Constructor.
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

    this.connectWakeEvent()
  }

  /** connectOnlineEvent. */
  connectOnlineEvent() {
    window.addEventListener("online", this.updateSessionStatus, false)
  }

  /** connectWakeEvent. */
  connectWakeEvent() {
    wakeEvent(this.updateSessionStatus)
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
   * sessionStatus.
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
   * onSignedOut.
   * @param {Function} callback
   */
  onSignedOut(callback) {
    // @ts-expect-error
    this.addEvent("onSignedOut", callback)
  }

  /** startTimeout. */
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

  /** stopTimeout. */
  stopTimeout() {
    if (this.updateTimeout)
      clearTimeout(this.updateTimeout)
  }

  /** updateSessionStatus. */
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
   * updateMetaElementsFromResult.
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
   * updateUserSessionsFromResult.
   * @param {SessionStatusResult} result
   */
  updateUserSessionsFromResult(result) {
    for (const scopeName in result.scopes) {
      this.updateUserSessionScopeFromResult(scopeName, result.scopes[scopeName])
    }
  }

  /**
   * updateUserSessionScopeFromResult.
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
