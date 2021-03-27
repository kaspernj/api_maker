const Devise = require("./devise.cjs")
const inflection = require("inflection")
const wakeEvent = require("wake-event")

module.exports = class ApiMakerSessionStatusUpdater {
  static current() {
    if (!window.apiMakerSessionStatusUpdater)
      window.apiMakerSessionStatusUpdater = new ApiMakerSessionStatusUpdater()

    return window.apiMakerSessionStatusUpdater
  }

  constructor(args = {}) {
    this.debugging = args.debug || false
    this.events = {}
    this.timeout = args.timeout || 600000

    this.connectOnlineEvent()
    this.connectWakeEvent()
  }

  connectOnlineEvent() {
    window.addEventListener("online", () => this.updateSessionStatus(), false)
  }

  connectWakeEvent() {
    wakeEvent(() => this.updateSessionStatus())
  }

  debug(message) {
    if (this.debugging)
      console.log(`ApiMakerSessionStatusUpdater: ${message}`)
  }

  async sessionStatus() {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api_maker/session_statuses", true)
      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText)
        resolve(response)
      }
      xhr.send()
    })
  }

  onSignedOut(callback) {
    this.addEvent("onSignedOut", callback)
  }

  startTimeout() {
    this.debug("startTimeout")

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

  stopTimeout() {
    if (this.updateTimeout)
      clearTimeout(this.updateTimeout)
  }

  async updateSessionStatus() {
    this.debug("updateSessionStatus")

    const result = await this.sessionStatus()

    this.debug(`Result: ${JSON.stringify(result, null, 2)}`)
    this.updateMetaElementsFromResult(result)
    this.updateUserSessionsFromResult(result)
  }

  updateMetaElementsFromResult(result) {
    this.debug("updateMetaElementsFromResult")
    const csrfTokenElement = document.querySelector("meta[name='csrf-token']")

    if (csrfTokenElement) {
      this.debug(`Changing token from "${csrfTokenElement.getAttribute("content")}" to "${result.csrf_token}"`)
      csrfTokenElement.setAttribute("content", result.csrf_token)
    } else {
      this.debug("csrf token element couldn't be found")
    }
  }

  updateUserSessionsFromResult(result) {
    for(const scopeName in result.scopes) {
      this.updateUserSessionScopeFromResult(scopeName, result.scopes[scopeName])
    }
  }

  updateUserSessionScopeFromResult(scopeName, scope) {
    const deviseIsSignedInMethodName = `is${inflection.camelize(scopeName)}SignedIn`
    const currentlySignedIn = Devise[deviseIsSignedInMethodName]()
    const signedInOnBackend = scope.signed_in

    if (currentlySignedIn && !signedInOnBackend) {
      this.debug(`${inflection.camelize(scopeName)} signed in on frontend but not in backend!`)

      Devise.setSignedOut({scope: scopeName})
      Devise.callSignOutEvent({scope: scopeName})
    }
  }
}
