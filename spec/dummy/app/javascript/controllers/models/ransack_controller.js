import { Controller } from "stimulus"
import Project from "ApiMaker/Models/Project"

export default class extends Controller {
  connect() {
    var promiseWithoutPreload = Project.ransack({name_cont: "test-ransack"}).toArray().then((projects) => {
      this.element.dataset.projectsWithoutPreload = JSON.stringify(projects)
    })
    var promiseWithPreload = Project.ransack({name_cont: "test-ransack"}).preload("tasks").toArray().then((projects) => {
      this.element.dataset.projectsWithPreload = JSON.stringify(projects)
    })
    Promise.all([promiseWithoutPreload, promiseWithPreload]).then(() => {
      this.element.dataset.ransackCompleted = true
    })
  }
}
