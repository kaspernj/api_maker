import EventCreated from "api-maker/event-created"
import React from "react"
import Task from "api-maker/models/task"

export default class ModelsCreatedEvent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tasks: []
    }
  }

  render() {
    const { tasks } = this.state

    return (
      <Layout className="component-models-created-event">
        <EventCreated modelClass={Task} onCreated={args => this.onCreated(args)} />

        <table className="tasks-table">
          <tbody>
            {tasks.map(task =>
              <tr className="task-row" data-task-id={task.id()} key={task.cacheKey()}>
                <td className="id-column">
                  {task.id()}
                </td>
                <td className="name-column">
                  {task.name()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Layout>
    )
  }

  onCreated(args) {
    this.setState({
      tasks: this.state.tasks.concat([args.model])
    })
  }
}
