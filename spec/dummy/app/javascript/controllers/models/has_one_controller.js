import { Controller } from "stimulus"
import Project from "ApiMaker/Models/Project"

export default class extends Controller {
  connect() {
    Project.find(this.element.dataset.projectId).then((project) => {
      project.task().then((task) => {
        var result = {"id": task.id(), "name": task.name()}

        this.element.dataset.task = JSON.stringify(result)
        this.element.dataset.hasOneCompleted = true
      })
    })
  }
}
