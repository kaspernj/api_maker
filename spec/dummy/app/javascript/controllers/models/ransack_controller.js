import { Controller } from "stimulus"
import Project from "ApiMaker/Models/Project"

export default class extends Controller {
  connect() {
    Project.ransack({name_cont: "test-ransack"}).toArray().then((array) => {
      var ids = []
      for(var key in array) {
        var model = array[key]
        ids.push(model.id())
      }

      this.element.innerText = JSON.stringify(ids)
      this.element.dataset.ransackCompleted = true
    })
  }
}
