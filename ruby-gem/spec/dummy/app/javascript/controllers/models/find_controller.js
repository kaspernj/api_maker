import {Controller} from "stimulus"
import models from "@kaspernj/api-maker/build/models"

const {Project} = models

export default class extends Controller {
  connect() {
    Project.find(this.element.dataset.projectId).then((project) => {
      this.element.dataset.projectData = JSON.stringify(project)
      this.element.dataset.findCompleted = true
    })
  }
}
