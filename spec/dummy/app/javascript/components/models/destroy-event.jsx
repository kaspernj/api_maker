import EventDestroyed from "api-maker/event-destroyed"
import React from "react"

export default class ModelsDestroyEvent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount() {
    Task.ransack().toArray(tasks => this.setState({tasks}))
  }

  render() {
    var { tasks } = this.state

    return (
      <div className="component-models-destroy-event">
        {tasks && tasks.map(task =>
          <EventDestroyed model={task} onDestroyed={(args) => this.onDestroyed(args)} />
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
