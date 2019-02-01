import { Controller } from "stimulus"
import Devise from "api-maker/devise"

export default class extends Controller {
  static targets = ["email", "password", "remember"]

  onSubmit(e) {
    e.preventDefault()

    Devise.signIn(this.emailTarget.value, this.passwordTarget.value, {rememberMe: this.rememberTarget.checked})
      .then((response) => {
        this.element.dataset["successResponse"] = JSON.stringify(response)
      }, (response) => {
        this.element.dataset["failResponse"] = JSON.stringify(response)
      })
  }
}
