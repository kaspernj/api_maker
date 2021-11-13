import { EventCreated } from "@kaspernj/api-maker"
import React from "react"

export default class ModelsCreatedEvent extends React.PureComponent {
  state = {
    tasks: []
  }

  render() {
    const {tasks} = this.state

    return (
      <Layout className="component-models-created-event">
        <EventCreated modelClass={Task} onCreated={this.onCreated} />

        <table className="tasks-table">
          <tbody>
            {tasks.map(task =>
              <tr className="task-row" data-task-id={task.id()} key={task.id()}>
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

  onCreated = ({model: task}) =>
    this.setState({
      tasks: this.state.tasks.concat([task])
    })
}
