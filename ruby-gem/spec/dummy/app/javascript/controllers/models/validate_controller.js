import { Controller } from "stimulus"

export default class extends Controller {
  connect() {
    const task = new Task({name: " "})
    task.isValidOnServer().then((response) => {
      this.element.dataset.validateResponse = JSON.stringify(response)
    })
  }
}
