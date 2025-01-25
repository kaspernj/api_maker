import Checkbox from "@kaspernj/api-maker/build/bootstrap/checkbox"
import Layout from "components/layout"
import Params from "@kaspernj/api-maker/build/params"
import React from "react"
import {Task} from "models"

export default class BootstrapCheckboxBoolean extends React.PureComponent {
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
    return (
      <div className="content-container">
        <form onSubmit={this.onSubmit}>
          <Checkbox attribute="finished" model={this.state.task} />
          <input type="submit" value="Save" />
        </form>
      </div>
    )
  }

  onSubmit = async (e) => {
    e.preventDefault()

    const {task} = this.state

    try {
      await task.saveRaw(e.target)
      console.log("Task was saved")
    } catch (error) {
      console.error("Task couldnt be saved", {error})
    }
  }
}
