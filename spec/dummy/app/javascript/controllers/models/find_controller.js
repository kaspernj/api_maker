import { Controller } from "stimulus"

export default class extends Controller {
  connect() {
    Project.find(this.element.dataset.projectId).then((project) => {
      this.element.dataset.projectData = JSON.stringify(project)
      this.element.dataset.findCompleted = true
    })
  }
}
