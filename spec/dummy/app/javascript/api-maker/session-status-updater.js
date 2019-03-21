import Devise from "./devise"

var inflection = require("inflection")

export default class ApiMakerSessionStatusUpdater {
  static current() {
    if (!window.apiMakerSessionStatusUpdater)
      window.apiMakerSessionStatusUpdater = new ApiMakerSessionStatusUpdater()

    return window.apiMakerSessionStatusUpdater
  }

  constructor() {
    this.debugging = true
    this.events = {}
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

    this.updateSessionStatus()

    if (this.timeout)
      clearTimeout(this.timeout)

    setTimeout(
      () => {
        this.startTimeout()
        this.updateSessionStatus()
      },
      300000
    )
  }

  updateSessionStatus() {
    console.log("updateSessionStatus")

    this.sessionStatus().then(result => {
      this.debug(`Result: ${JSON.stringify(result, null, 2)}`)
      this.updateMetaElementsFromResult(result)
      this.updateUserSessionsFromResult(result)
    })
  }

  updateMetaElementsFromResult(result) {
    var csrfParamElement = document.querySelector("meta[name='csrf-param']")
    var csrfTokenElement = document.querySelector("meta[name='csrf-token']")

    this.debug(`Changing param from "${csrfParamElement.getAttribute("content")}" to "${result.csrf_param}"`)
    this.debug(`Changing token from "${csrfTokenElement.getAttribute("content")}" to "${result.csrf_token}"`)

    csrfParamElement.setAttribute("content", result.csrf_param)
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

    console.log({ scopeName })
    console.log({ currentlySignedIn })

    if (currentlySignedIn && !signedInOnBackend) {
      console.log(`${scopeName} signed in on frontend but not in backend!`)

      Devise.setSignedOut({scope: scopeName})
      Devise.callSignOutEvent(args)
    }
  }
}
