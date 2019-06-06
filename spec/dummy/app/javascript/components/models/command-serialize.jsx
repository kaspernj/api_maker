import Params from "shared/params"
import React from "react"
import Task from "api-maker/models/task"

export default class ModelsCommandSerialize extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount() {
    var params = Params.parse()

    Task.commandSerialize({task_id: params.task_id}).then(response => {
      this.setState({task: response.test.task})
    })
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
