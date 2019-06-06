import EventDestroyed from "api-maker/event-destroyed"
import React from "react"
import Task from "api-maker/models/task"

export default class ModelsDestroyEvent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  async componentWillMount() {
    var tasks = await Task.ransack().toArray()
    // console.error(JSON.stringify(tasks))
    this.setState({tasks})
  }

  render() {
    var { tasks } = this.state

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
