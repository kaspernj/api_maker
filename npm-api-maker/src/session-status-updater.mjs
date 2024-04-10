import config from "./config.mjs"
import Devise from "./devise.mjs"
import * as inflection from "inflection"
import Logger from "./logger.mjs"
import wakeEvent from "wake-event"

const logger = new Logger({name: "ApiMaker / SessionStatusUpdater"})

export default class ApiMakerSessionStatusUpdater {
  static current () {
    if (!globalThis.apiMakerSessionStatusUpdater)
      globalThis.apiMakerSessionStatusUpdater = new ApiMakerSessionStatusUpdater()

    return globalThis.apiMakerSessionStatusUpdater
  }

  constructor (args = {}) {
    this.events = {}
    this.timeout = args.timeout || 600000

    this.connectOnlineEvent()
    this.connectWakeEvent()
  }

  connectOnlineEvent () {
    window.addEventListener("online", this.updateSessionStatus, false)
  }

  connectWakeEvent () {
    wakeEvent(this.updateSessionStatus)
  }

  async sessionStatus () {
    return new Promise((resolve) => {
      const requestPath = ""

      if (config.getHost()) requestPath += config.getHost()

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

  onSignedOut (callback) {
    this.addEvent("onSignedOut", callback)
  }

  startTimeout () {
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

  stopTimeout () {
    if (this.updateTimeout)
      clearTimeout(this.updateTimeout)
  }

  updateSessionStatus = async () => {
    logger.debug("updateSessionStatus")

    const result = await this.sessionStatus()

    logger.debug(() => `Result: ${JSON.stringify(result, null, 2)}`)
    this.updateMetaElementsFromResult(result)
    this.updateUserSessionsFromResult(result)
  }

  updateMetaElementsFromResult (result) {
    logger.debug("updateMetaElementsFromResult")
    const csrfTokenElement = document.querySelector("meta[name='csrf-token']")

    if (csrfTokenElement) {
      logger.debug(() => `Changing token from "${csrfTokenElement.getAttribute("content")}" to "${result.csrf_token}"`)
      csrfTokenElement.setAttribute("content", result.csrf_token)
    } else {
      logger.debug("csrf token element couldn't be found")
    }
  }

  updateUserSessionsFromResult (result) {
    for (const scopeName in result.scopes) {
      this.updateUserSessionScopeFromResult(scopeName, result.scopes[scopeName])
    }
  }

  updateUserSessionScopeFromResult (scopeName, scope) {
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
