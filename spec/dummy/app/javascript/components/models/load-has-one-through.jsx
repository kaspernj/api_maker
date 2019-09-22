import React from "react"
import Task from "api-maker/models/task"

export default class ModelsLoadHasOneThrough extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  async componentDidMount() {
    var task = await Task.find(this.props.match.params.task_id)

    await task.loadAccount()

    this.setState({
      account: task.account(),
      task
    })
  }

  render() {
    return (
      <div className="component-models-load-has-one-through">
        {this.state.account && this.state.task && this.content()}
      </div>
    )
  }

  content() {
    var { account, task } = this.state

    return (
      <div className="content-container" data-account-id={account.id()} data-task-id={task.id()}>
        Done!
      </div>
    )
  }
}
