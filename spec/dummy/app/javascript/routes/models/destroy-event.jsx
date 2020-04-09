import { EventDestroyed } from "@kaspernj/api-maker"
import React from "react"

export default class ModelsDestroyEvent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  async componentDidMount() {
    const tasks = await Task.ransack().toArray()
    this.setState({tasks})
  }

  render() {
    const { tasks } = this.state

    return (
      <div className="component-models-destroy-event">
        {tasks && tasks.map(task =>
          <div className="task-row" data-task-id={task.id()} key={task.cacheKey()}>
            <EventDestroyed model={task} onDestroyed={(args) => this.onDestroyed(args)} />
          </div>
        )}
      </div>
    )
  }

  onDestroyed(args) {
    this.setState({
      tasks: this.state.tasks.filter(task => task.id() != args.model.id())
    })
  }
}
