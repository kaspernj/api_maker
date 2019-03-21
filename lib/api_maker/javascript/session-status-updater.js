import Devise from "./devise"

var inflection = require("inflection")

export default class ApiMakerSessionStatusUpdater {
  static current() {
    if (!window.apiMakerSessionStatusUpdater)
      window.apiMakerSessionStatusUpdater = new ApiMakerSessionStatusUpdater()

    return window.apiMakerSessionStatusUpdater
  }

  constructor(args = {}) {
    this.debugging = false
    this.events = {}
    this.timeout = args["timeout"] || 600000
  }

  debug(message) {
    if (this.debugging)
      console.log(`ApiMakerSessionStatusUpdater: ${message}`)
  }

  sessionStatus() {
    return new Promise(resolve => {
      var xhr = new XMLHttpRequest()
      xhr.open("POST", "/api_maker/session_statuses", true)
      xhr.onload = () => {
        console.log(xhr.responseText)
        var response = JSON.parse(xhr.responseText)
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

  updateSessionStatus() {
    this.debug("updateSessionStatus")

    this.sessionStatus().then(result => {
      this.debug(`Result: ${JSON.stringify(result, null, 2)}`)
      this.updateMetaElementsFromResult(result)
      this.updateUserSessionsFromResult(result)
    })
  }

  updateMetaElementsFromResult(result) {
    var csrfTokenElement = document.querySelector("meta[name='csrf-token']")

    this.debug(`Changing token from "${csrfTokenElement.getAttribute("content")}" to "${result.csrf_token}"`)

    csrfTokenElement.setAttribute("content", result.csrf_token)
  }

  updateUserSessionsFromResult(result) {
    for(var scopeName in result.scopes) {
      this.updateUserSessionScopeFromResult(scopeName, result.scopes[scopeName])
    }
  }

  updateUserSessionScopeFromResult(scopeName, scope) {
    var deviseMethodName = `current${inflection.camelize(scopeName)}`
    var deviseIsSignedInMethodName = `is${inflection.camelize(scopeName)}SignedIn`
    var currentlySignedIn = Devise[deviseIsSignedInMethodName]()
    var signedInOnBackend = scope.signed_in

    if (currentlySignedIn && !signedInOnBackend) {
      this.debug(`${inflection.camelize(scopeName)} signed in on frontend but not in backend!`)

      Devise.setSignedOut({scope: scopeName})
      Devise.callSignOutEvent({scope: scopeName})
    }
  }
}
