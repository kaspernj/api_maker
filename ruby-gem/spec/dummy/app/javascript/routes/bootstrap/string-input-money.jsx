import { digg } from "@kaspernj/object-digger"
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
    console.log(params)

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
        <form onSubmit={(e) => this.onSubmit(e)}>
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

  async onSubmit(e) {
    e.preventDefault()

    const project = digg(this.state, "project")

    await project.saveRaw(e.target)
    console.log("Project was saved")
  }
}
