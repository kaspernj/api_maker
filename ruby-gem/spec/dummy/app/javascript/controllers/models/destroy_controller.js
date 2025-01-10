import {Controller} from "stimulus"
import models from "@kaspernj/api-maker/build/models"

const {Project} = models

export default class extends Controller {
  connect() {
    Project.find(this.element.dataset.projectId).then((project) => {
      project.destroy().then((data) => {
        this.element.dataset.destroyCompleted = true
      })
    })
  }
}
