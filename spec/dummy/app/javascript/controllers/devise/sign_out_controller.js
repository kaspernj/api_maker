import { Controller } from "stimulus"
import Devise from "api-maker/devise"

export default class extends Controller {
  static targets = ["link"]

  onSignOutClicked(e) {
    e.preventDefault()

    Devise.signOut().then(deviseSignOutResponse => {
      var currentUserResult = Devise.currentUser()
      var isUserSignedInResult = Devise.isUserSignedIn()

      this.element.dataset["successResponse"] = JSON.stringify({
        deviseSignOutResponse,
        currentUserResult,
        isUserSignedInResult
      })
    }, (response) => {
      this.element.dataset["failResponse"] = JSON.stringify(response)
    })
  }
}
