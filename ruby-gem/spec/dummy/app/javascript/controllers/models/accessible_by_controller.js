import { Controller } from "stimulus"

export default class extends Controller {
  connect() {
    Task.ransack().accessibleBy("testAccessibleBy").toArray().then(tasks => {
      let result = []
      for(let task of tasks) {
        result.push({id: task.id(), name: task.name()})
      }

      this.element.dataset.result = JSON.stringify(result)
      this.element.dataset.accessibleByCompleted = true
    })
  }
}
