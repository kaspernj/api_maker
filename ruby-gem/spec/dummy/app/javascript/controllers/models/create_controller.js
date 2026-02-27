import {Controller} from "stimulus"
import {Project} from "models.js"
import Params from "@kaspernj/api-maker/build/params.js"

export default class ModelsCreateController extends Controller {
  connect() {
    this.element.dataset.initializeStarted = true
    const project = new Project()
    const params = Params.parse()
    project.assignAttributes({accountId: params.account_id, name: "test-create-project"})
    project.create().then((data) => {
      this.element.dataset.createCompleted = true
      this.element.dataset.projectName = data.model.name()
    })
  }
}
