import { Controller } from "stimulus"
import Project from "ApiMaker/Models/Project"

export default class extends Controller {
  connect() {
    Project.find(this.element.dataset.projectId).then((project) => {
      project.loadProjectDetail().then(() => {
        var result = {"id": project.projectDetail().id(), "details": project.projectDetail().details()}

        this.element.dataset.projectDetail = JSON.stringify(result)
        this.element.dataset.hasOneCompleted = true
      })
    })
  }
}
