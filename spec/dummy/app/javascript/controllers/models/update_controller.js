import { Controller } from "stimulus"
import Project from "api-maker/models/project"

export default class extends Controller {
  connect() {
    // Test that a found model can be updated and changed
    Project.find(this.element.dataset.projectId).then((project) => {
      project.update({name: "test-update-project"}).then((data) => {
        this.element.dataset.updateCompleted = true
      })
    })

    // Test changing an attribute and then changing it back to its original value
    var result = {}
    var project = new Project({name: "not-renamed"})

    result.initialChanged = project.isChanged()
    result.initialChanges = JSON.parse(JSON.stringify(project.changes))

    project.assignAttributes({name: "test-update-project"})

    result.firstChanged = project.isChanged()
    result.firstChanges = JSON.parse(JSON.stringify(project.changes))

    project.assignAttributes({name: "not-renamed"})

    result.secondChanged = project.isChanged()
    result.secondChanges = JSON.parse(JSON.stringify(project.changes))

    this.element.dataset.result = JSON.stringify(result)
  }
}
