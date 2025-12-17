import { Controller } from "stimulus"
import Devise from "@kaspernj/api-maker/build/devise.js"

export default class extends Controller {
  static targets = ["link"]

  onSignOutClicked(e) {
    e.preventDefault()

    Devise.signOut().then(deviseSignOutResponse => {
      const currentUserResult = Devise.currentUser()
      const isUserSignedInResult = Devise.isUserSignedIn()

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
