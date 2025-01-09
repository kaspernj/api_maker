import Input from "@kaspernj/api-maker/build/bootstrap/input"
import Layout from "components/layout"
import Params from "@kaspernj/api-maker/build/params"
import React from "react"

export default class BootstrapStringInputDatetimeLocal extends React.PureComponent {
  state = {}

  componentDidMount() {
    this.loadTask()
  }

  async loadTask() {
    const params = Params.parse()
    const task = await Task.find(params.task_id)
    this.setState({task})
  }

  render() {
    return (
      <Layout>
        {this.state.task && this.content()}
      </Layout>
    )
  }

  content() {
    const { task } = this.state

    return (
      <div className="content-container">
        <form onSubmit={this.onSubmit}>
          <Input attribute="createdAt" model={task} type="datetime-local" />
          <input type="submit" value="Save" />
        </form>
      </div>
    )
  }

  onSubmit = (e) => {
    e.preventDefault()

    const { task } = this.state

    task.saveRaw(e.target).then(() => {
      console.log("Task was saved")
    }, (response) => {
      console.log("Error!")
    })
  }
}
