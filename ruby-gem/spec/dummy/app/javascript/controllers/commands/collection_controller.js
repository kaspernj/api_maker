import { Controller } from "stimulus"

export default class extends Controller {
  connect() {
    Task.testCollection().then((response) => {
      this.element.dataset.testCollectionResponse = JSON.stringify(response)
    })
  }
}
