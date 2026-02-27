import {digg, digs} from "diggerize"
import Params from "@kaspernj/api-maker/build/params.js"
import React from "react"
import {User} from "models.js"

export default class ModelsHasManyAs extends React.PureComponent {
  params = Params.parse()
  state = {
    supportedTasks: undefined,
    user: undefined
  }
  userId = digg(this, "params", "user_id")

  componentDidMount() {
    this.loadUser()
  }

  async loadUser() {
    const {userId} = digs(this, "userId")
    const user = await User.find(userId)
    const supportedTasks = await user.supportedTasks().toArray()

    this.setState({
      supportedTasks,
      user
    })
  }

  render() {
    const {supportedTasks} = digs(this.state, "supportedTasks")

    return (
      <div className="routes-models-has-many-options-primary-key">
        {supportedTasks && supportedTasks.map((supportedTask) =>
          <div className="supported-task-container" data-task-id={supportedTask.id()} key={supportedTask.id()}>
            {supportedTask.name()}
          </div>
        )}
      </div>
    )
  }
}
