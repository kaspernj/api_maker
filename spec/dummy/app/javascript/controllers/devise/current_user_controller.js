import { Controller } from "stimulus"
import Devise from "ApiMaker/Devise"

export default class extends Controller {
  connect() {
    Devise.currentUser().then((user) => {
      var result = {
        "id": user.id(),
        "email": user.email()
      }

      this.element.dataset.currentUserResult = JSON.stringify(result)
      this.element.dataset.currentUserCompleted = true
    })
  }
}
