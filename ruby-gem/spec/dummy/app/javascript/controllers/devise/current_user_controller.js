import { Controller } from "stimulus"
import Devise from "@kaspernj/api-maker/build/devise"

export default class DeviseCurrentUserController extends Controller {
  connect() {
    const user = Devise.currentUser()

    if (user) {
      const result = {
        id: user.id(),
        email: user.email()
      }

      this.element.dataset.currentUserResult = JSON.stringify(result)
    }

    this.element.dataset.currentUserCompleted = true
  }
}
