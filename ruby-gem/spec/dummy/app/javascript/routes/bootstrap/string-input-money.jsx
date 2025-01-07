import {digg} from "diggerize"
import Input from "@kaspernj/api-maker/build/bootstrap/input"
import Params from "@kaspernj/api-maker/build/params"
import React from "react"

export default class BootstrapStringInputDatetimeLocal extends React.PureComponent {
  state = {
    currenciesCollection: [["Danish kroner", "DKK"], ["American Dollars", "USD"]]
  }

  componentDidMount() {
    this.loadProject()
  }

  async loadProject() {
    const params = Params.parse()
    const project = await Project.find(digg(params, "project_id"))

    this.setState({project})
  }

  render() {
    return (
      <Layout>
        {this.state.project && this.content()}
      </Layout>
    )
  }

  content() {
    const { currenciesCollection, project } = this.state

    return (
      <div className="content-container">
        <form onSubmit={this.onSubmit}>
          <Input
            attribute="pricePerHour"
            currenciesCollection={currenciesCollection}
            label="Hourly price"
            model={project}
            type="money"
          />
          <input type="submit" value="Save" />
        </form>
      </div>
    )
  }

  onSubmit = async (e) => {
    e.preventDefault()

    const project = digg(this.state, "project")

    await project.saveRaw(e.target)
    console.log("Project was saved")
  }
}
