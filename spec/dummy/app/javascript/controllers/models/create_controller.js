import { Controller } from "stimulus"
import Params from "shared/params"

export default class extends Controller {
  connect() {
    this.element.dataset.initializeStarted = true
    const project = new Project()
    const params = Params.parse()
    project.assignAttributes({account_id: params.account_id, name: "test-create-project"})
    project.create().then((data) => {
      this.element.dataset.createCompleted = true
      this.element.dataset.projectName = data.model.name()
    })
  }
}
