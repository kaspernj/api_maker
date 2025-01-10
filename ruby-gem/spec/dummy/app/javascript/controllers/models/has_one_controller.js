import {Controller} from "stimulus"
import models from "@kaspernj/api-maker/build/models"

const {Project} = models

export default class extends Controller {
  connect() {
    Project.find(this.element.dataset.projectId).then((project) => {
      project.loadProjectDetail().then(() => {
        const result = {"id": project.projectDetail().id(), "details": project.projectDetail().details()}

        this.element.dataset.projectDetail = JSON.stringify(result)
        this.element.dataset.hasOneCompleted = true
      })
    })
  }
}
