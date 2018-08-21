import { Controller } from "stimulus"
import Task from "ApiMaker/Models/Task"

export default class extends Controller {
  connect() {
    Task.find(this.element.dataset.taskId).then((task) => {
      task.loadProject().then(() => {
        var result = {"id": task.project().id(), "name": task.project().name()}

        this.element.dataset.project = JSON.stringify(result)
        this.element.dataset.belongsToCompleted = true
      })
    })
  }
}
