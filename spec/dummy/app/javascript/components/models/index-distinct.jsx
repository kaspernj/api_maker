import Hash from "shared/hash"
import Params from "shared/params"
import React from "react"
import Task from "api-maker/models/task"

export default class ModelsDestroyEvent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  async componentDidMount() {
    var params = Params.parse()
    var accountId = Hash.fetch("account_id", params)
    var tasks = await Task.ransack({account_marked_tasks_account_id_eq: accountId}).distinct().toArray()
    // console.error(JSON.stringify(tasks))
    this.setState({tasks})
  }

  render() {
    var { tasks } = this.state

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
