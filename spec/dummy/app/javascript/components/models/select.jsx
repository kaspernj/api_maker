import React from "react"
import Task from "api-maker/models/task"

export default class ModelsSelect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount() {
    var tasks = await Task.ransack().select({Task: ["id", "name"]}).toArray()
    this.setState({tasks})
  }

  render() {
    return (
      <div className="component-models-select">
        {this.state.tasks && this.content()}
      </div>
    )
  }

  content() {
    return (
      <div className="content-container">
        {JSON.stringify(this.state.tasks, null, 2)}
      </div>
    )
  }
}
