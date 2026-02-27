import {Controller} from "stimulus"
import {Project} from "models.js"

export default class extends Controller {
  connect() {
    Project.find(this.element.dataset.projectId).then((project) => {
      project.tasks().toArray().then((tasks) => {
        const result = []
        for(const key in tasks) {
          const task = tasks[key]
          result.push({"id": task.id(), "name": task.name()})
        }

        this.element.dataset.tasks = JSON.stringify(result)
        this.element.dataset.hasManyCompleted = true
      })
    })
  }
}
