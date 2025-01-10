import {Controller} from "stimulus"
import models from "@kaspernj/api-maker/build/models"

const {Task} = models

export default class extends Controller {
  connect() {
    Task.find(this.element.dataset.taskId).then((task) => {
      task.loadProject().then(() => {
        const result = {"id": task.project().id(), "name": task.project().name()}

        this.element.dataset.project = JSON.stringify(result)
        this.element.dataset.belongsToCompleted = true
      })
    })
  }
}
