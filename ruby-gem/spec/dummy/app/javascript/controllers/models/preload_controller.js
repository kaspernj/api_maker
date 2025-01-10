import {Controller} from "stimulus"
import models from "@kaspernj/api-maker/build/models"

const {Task} = models

export default class extends Controller {
  connect() {
    Task.ransack({"id_eq": this.element.taskId}).preload("project").first().then((taskWithPreload) => {
      this.element.dataset.taskWithPreload = JSON.stringify(taskWithPreload)

      Task.ransack({"id_eq": this.element.taskId}).first().then((taskWithoutPreload) => {
        this.element.dataset.taskWithoutPreload = JSON.stringify(taskWithoutPreload)
        this.element.dataset.preloadCompleted = true
      })
    })
  }
}
