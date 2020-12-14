import { Controller } from "stimulus"
import Devise from "api-maker/devise"

export default class DeviseSignInController extends Controller {
  static targets = ["email", "password", "remember"]

  async onSubmit(e) {
    e.preventDefault()

    const deviseSignInResponse = await Devise.signIn(this.emailTarget.value, this.passwordTarget.value, {rememberMe: this.rememberTarget.checked})
    const currentUserResult = Devise.currentUser()
    const isUserSignedInResult = Devise.isUserSignedIn()

    this.element.dataset["successResponse"] = JSON.stringify({
      deviseSignInResponse,
      currentUserResult,
      isUserSignedInResult
    })
  }
}
