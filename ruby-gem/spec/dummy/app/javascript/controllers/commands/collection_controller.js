import {Controller} from "stimulus"
import models from "@kaspernj/api-maker/build/models"

const {Task} = models

export default class extends Controller {
  connect() {
    Task.testCollection().then((response) => {
      this.element.dataset.testCollectionResponse = JSON.stringify(response)
    })
  }
}
