import { Controller } from "stimulus"
import Task from "ApiMaker/Models/Task"

export default class extends Controller {
  connect() {
    Task.testCollection().then((response) => {
      this.element.dataset.testCollectionResponse = JSON.stringify(response)
    })
  }
}
