import { Controller } from "stimulus"
import Project from "ApiMaker/Models/Project"

export default class extends Controller {
  connect() {
    Project.find(this.element.dataset.projectId).then((project) => {
      project.update({name: "test-update-project"}).then(() => {
        this.element.dataset.updateCompleted = true
      }, (data) => {
        console.log("Error: " + JSON.stringify(data))
      })
    })
  }
}
