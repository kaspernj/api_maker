import { Controller } from "stimulus"
import Project from "api-maker/models/project"

export default class extends Controller {
  connect() {
    Project.find(this.element.dataset.projectId).then((project) => {
      project.tasks().toArray().then((tasks) => {
        var result = []
        for(var key in tasks) {
          var task = tasks[key]
          result.push({"id": task.id(), "name": task.name()})
        }

        this.element.dataset.tasks = JSON.stringify(result)
        this.element.dataset.hasManyCompleted = true
      })
    })
  }
}
