import {digg} from "diggerize"
import Layout from "components/layout"
import React from "react"

export default class ModelsUpdate extends React.PureComponent {
  state = {
    projectId: digg(this, "props", "match", "params", "id")
  }

  componentDidMount() {
    this.findAndUpdateProject()
    this.changeAttributes()
  }

  async findAndUpdateProject() {
    const projectId = Hash.fetch("projectId", this.state)

    // Test that a found model can be updated and changed
    const project = await Project.find(projectId)
    const data = await project.update({name: "test-update-project"})

    this.setState({updateCompleted: true})
  }

  changeAttributes() {
    // Test changing an attribute and then changing it back to its original value
    const result = {}
    const project = new Project({name: "not-renamed"})

    result.initialChanged = project.isChanged()
    result.initialChanges = JSON.parse(JSON.stringify(project.changes))

    project.assignAttributes({name: "test-update-project"})

    result.firstChanged = project.isChanged()
    result.firstChanges = JSON.parse(JSON.stringify(project.changes))

    project.assignAttributes({name: "not-renamed"})

    result.secondChanged = project.isChanged()
    result.secondChanges = JSON.parse(JSON.stringify(project.changes))

    this.setState({changeAttributesResult: result})
  }

  render() {
    const {changeAttributesResult, projectId, updateCompleted} = this.state

    return (
      <Layout>
        <div
          className="models-update"
          data-change-attributes-result={JSON.stringify(changeAttributesResult)}
          data-project-id={projectId}
          data-update-completed={updateCompleted}
        />
      </Layout>
    )
  }
}
