import { Controller } from "stimulus"
import Task from "api-maker/models/task"

export default class extends Controller {
  connect() {
    var task = new Task({name: " "})
    task.isValidOnServer().then((response) => {
      this.element.dataset.validateResponse = JSON.stringify(response)
    })
  }
}
