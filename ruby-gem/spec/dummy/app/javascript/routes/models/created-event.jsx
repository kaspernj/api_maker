import React, {memo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import models from "@kaspernj/api-maker/build/models"
import Layout from "components/layout"
import useCreatedEvent from "@kaspernj/api-maker/build/use-created-event"

const {Task} = models

export default memo(shapeComponent(class ModelsCreatedEvent extends ShapeComponent {
  setup() {
    this.useStates({
      tasks: []
    })
    useCreatedEvent(Task, this.tt.onCreated)
  }

  render() {
    const {tasks} = this.state

    return (
      <Layout className="component-models-created-event">
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
}))
