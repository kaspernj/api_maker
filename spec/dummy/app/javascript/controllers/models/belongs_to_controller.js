import { Controller } from "stimulus"
import Task from "ApiMaker/Models/Task"

export default class extends Controller {
  connect() {
    Task.find(this.element.dataset.taskId).then((task) => {
      task.project().then((project) => {
        var result = {"id": project.id(), "name": project.name()}

        this.element.dataset.project = JSON.stringify(result)
        this.element.dataset.belongsToCompleted = true
      })
    })
  }
}
