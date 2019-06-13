import { Controller } from "stimulus"
import Devise from "api-maker/devise"

export default class DeviseCurrentUserController extends Controller {
  connect() {
    var user = Devise.currentUser()

    if (user) {
      var result = {
        "id": user.id(),
        "email": user.email()
      }

      this.element.dataset.currentUserResult = JSON.stringify(result)
    }

    this.element.dataset.currentUserCompleted = true
  }
}
