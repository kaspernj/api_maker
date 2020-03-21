import { Controller } from "stimulus"

export default class extends Controller {
  connect() {
    Project.find(this.element.dataset.projectId).then((project) => {
      project.destroy().then((data) => {
        this.element.dataset.destroyCompleted = true
      })
    })
  }
}
