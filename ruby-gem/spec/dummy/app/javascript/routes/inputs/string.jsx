// @ts-check
import {digg, digs} from "diggerize"
import Input from "@kaspernj/api-maker/build/bootstrap/input"
import Layout from "components/layout"
import Params from "@kaspernj/api-maker/build/params.js"
import {Project} from "models.js"
import React from "react"

export default class RoutesInputsString extends React.PureComponent {
  params = Params.parse()
  autoRefresh = Boolean(this.params.auto_refresh)
  projectId = digg(this, "params", "project_id")

  state = {
    project: undefined
  }

  componentDidMount() {
    this.loadProject()
  }

  async loadProject() {
    const {projectId} = digs(this, "projectId")
    const project = await Project.find(projectId)

    this.setState({project})
  }

  render() {
    const {autoRefresh} = digs(this, "autoRefresh")
    const {project} = digs(this.state, "project")

    return (
      <Layout>
        {project &&
          <Input autoRefresh={autoRefresh} attribute="name" model={project} />
        }
      </Layout>
    )
  }
}
