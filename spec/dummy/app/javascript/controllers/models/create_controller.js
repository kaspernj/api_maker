import { Controller } from "stimulus"
import Project from "ApiMaker/Models/Project"

export default class extends Controller {
  connect() {
    var project = new Project()
    project.assignAttributes({name: "test-create-project"})
    project.create().then((data) => {
      this.element.dataset.createCompleted = true
      this.element.dataset.projectName = data.model.name()
    })
  }
}
