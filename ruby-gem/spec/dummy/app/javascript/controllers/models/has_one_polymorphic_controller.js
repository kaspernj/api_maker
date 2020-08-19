import { Controller } from "stimulus"

export default class extends Controller {
  connect() {
    Project.find(this.element.dataset.projectId).then((project) => {
      project.loadPolymorphicModel().then(() => {
        const result = project.polymorphicModel().id()

        this.element.dataset.polymorphicModelId = result
        this.element.dataset.hasOneCompleted = true
      })
    })
  }
}
