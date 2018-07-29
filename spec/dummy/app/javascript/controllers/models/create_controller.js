import { Controller } from "stimulus"
import Project from "ApiMaker/Models/Project"

export default class extends Controller {
  connect() {
    var project = new Project()
    project.assignAttributes({name: "test-create-project"})
    project.create().then((project) => {
      this.element.dataset.createCompleted = true
    })
  }
}
