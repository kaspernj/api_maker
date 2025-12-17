import Params from "@kaspernj/api-maker/build/params.js"
import React from "react"
import {Task} from "models.js"

export default class ModelsCommandSerialize extends React.PureComponent {
  state = {}

  async componentDidMount() {
    const params = Params.parse()
    const response = await Task.commandSerialize({task_id: params.task_id})
    this.setState({task: response.test.task})
  }

  render() {
    return (
      <div className="component-models-command-serialize">
        {this.state.task && this.content()}
      </div>
    )
  }

  content() {
    return (
      <div className="content-container">
        {JSON.stringify(this.state.task, null, 2)}
      </div>
    )
  }
}
