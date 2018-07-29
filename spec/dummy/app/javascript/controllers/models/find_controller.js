import { Controller } from "stimulus"
import Project from "ApiMaker/Models/Project"

export default class extends Controller {
  connect() {
    Project.find(this.element.dataset.projectId).then((project) => {
      var projectElement = document.createElement("div")
      projectElement.classList.add("project")
      projectElement.dataset.projectName = project.name()
      projectElement.innerText = "Hello world"

      this.element.append(projectElement)
    })
  }
}
