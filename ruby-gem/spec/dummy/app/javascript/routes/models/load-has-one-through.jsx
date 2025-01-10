import models from "@kaspernj/api-maker/build/models"
import React from "react"

const {Task} = models

export default class ModelsLoadHasOneThrough extends React.PureComponent {
  state = {}

  async componentDidMount() {
    const task = await Task.find(this.props.match.params.task_id)

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
    const { account, task } = this.state

    return (
      <div className="content-container" data-account-id={account.id()} data-task-id={task.id()}>
        Done!
      </div>
    )
  }
}
