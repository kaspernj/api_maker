import { Controller } from "stimulus"
import Devise from "api-maker/devise"

export default class DeviseSignInController extends Controller {
  static targets = ["email", "password", "remember"]

  onSubmit(e) {
    e.preventDefault()

    Devise.signIn(this.emailTarget.value, this.passwordTarget.value, {rememberMe: this.rememberTarget.checked})
      .then((deviseSignInResponse) => {
        const currentUserResult = Devise.currentUser()
        const isUserSignedInResult = Devise.isUserSignedIn()

        this.element.dataset["successResponse"] = JSON.stringify({
          deviseSignInResponse,
          currentUserResult,
          isUserSignedInResult
        })
      }, (response) => {
        this.element.dataset["failResponse"] = JSON.stringify(response)
      })
  }
}
