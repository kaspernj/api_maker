import { Controller } from "stimulus"
import Task from "ApiMaker/Models/Task"

export default class extends Controller {
  connect() {
    Task.find(this.element.dataset.taskId).then((task) => {
      task.testMember().then((response) => {
        this.element.dataset.testMemberResponse = JSON.stringify(response)
      })
    })
  }
}
