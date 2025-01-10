import {Controller} from "stimulus"
import models from "@kaspernj/api-maker/build/models"

const {Task} = models

export default class extends Controller {
  connect() {
    Task.find(this.element.dataset.taskId).then((task) => {
      task.testMember().then((response) => {
        this.element.dataset.testMemberResponse = JSON.stringify(response)
      })
    })
  }
}
