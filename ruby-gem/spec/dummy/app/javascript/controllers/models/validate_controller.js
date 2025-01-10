import {Controller} from "stimulus"
import models from "@kaspernj/api-maker/build/models"

const {Task} = models

export default class extends Controller {
  connect() {
    const task = new Task({name: " "})
    task.isValidOnServer().then((response) => {
      this.element.dataset.validateResponse = JSON.stringify(response)
    })
  }
}
