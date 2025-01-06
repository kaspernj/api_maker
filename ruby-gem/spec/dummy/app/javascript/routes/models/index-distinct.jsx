import Hash from "shared/hash"
import Params from "@kaspernj/api-maker/build/params"
import React from "react"

export default class ModelsDestroyEvent extends React.PureComponent {
  state = {}

  async componentDidMount() {
    const params = Params.parse()
    const accountId = Hash.fetch("account_id", params)
    const tasks = await Task.ransack({account_marked_tasks_account_id_eq: accountId}).distinct().toArray()
    this.setState({tasks})
  }

  render() {
    const { tasks } = this.state

    return (
      <div className="component-models-index-distinct">
        {tasks && tasks.map(task =>
          <div className="task-row" data-task-id={task.id()} key={task.cacheKey()}>
            {task.name()}
          </div>
        )}
      </div>
    )
  }
}
