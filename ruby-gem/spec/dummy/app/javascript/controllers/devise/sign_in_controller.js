import {Controller} from "stimulus"
import Devise from "@kaspernj/api-maker/build/devise.js"
import Params from "@kaspernj/api-maker/build/params.js"
import User from "models/user.js"

export default class DeviseSignInController extends Controller {
  static targets = ["email", "password", "remember"]

  async onSubmit(e) {
    e.preventDefault()

    const params = Params.parse()

    let deviseSignInResponse

    if (params["current_user_with_preloads"]) {
      deviseSignInResponse = await Devise.signIn(
        this.emailTarget.value,
        this.passwordTarget.value,
        {
          loadQuery: User.ransack().preload("user_roles"),
          rememberMe: this.rememberTarget.checked
        }
      )
    } else {
      deviseSignInResponse = await Devise.signIn(this.emailTarget.value, this.passwordTarget.value, {rememberMe: this.rememberTarget.checked})
    }

    const currentUserResult = Devise.currentUser()
    const isUserSignedInResult = Devise.isUserSignedIn()

    this.element.dataset["successResponse"] = JSON.stringify({
      deviseSignInResponse,
      currentUserResult,
      isUserSignedInResult
    })
  }
}
