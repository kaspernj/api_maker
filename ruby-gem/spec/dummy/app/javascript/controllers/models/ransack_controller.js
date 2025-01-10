import {Controller} from "stimulus"
import models from "@kaspernj/api-maker/build/models"

const {Project} = models

export default class extends Controller {
  connect() {
    const promiseWithoutPreload = Project.ransack({name_cont: "test-ransack"}).toArray().then((projects) => {
      this.element.dataset.projectsWithoutPreload = JSON.stringify(projects)
    })
    const promiseWithPreload = Project.ransack({name_cont: "test-ransack"}).preload("tasks").toArray().then((projects) => {
      this.element.dataset.projectsWithPreload = JSON.stringify(projects)
    })
    Promise.all([promiseWithoutPreload, promiseWithPreload]).then(() => {
      this.element.dataset.ransackCompleted = true
    })
  }
}
