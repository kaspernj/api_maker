import React, {memo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import models from "@kaspernj/api-maker/build/models"
import useDestroyedEvent from "@kaspernj/api-maker/build/use-destroyed-event"

const {Task} = models

const TaskRow = memo(shapeComponent(class TaskRow extends ShapeComponent {
  render() {
    const {onDestroyed, task} = this.p

    useDestroyedEvent(task, onDestroyed)

    return (
      <div className="task-row" data-task-id={task.id()}>
        {task.id()}
      </div>
    )
  }
}))

export default memo(shapeComponent(class ModelsDestroyEvent extends ShapeComponent {
  setup() {
    this.useStates({
      tasks: null
    })
  }

  async componentDidMount() {
    const tasks = await Task.ransack().toArray()
    this.setState({tasks})
  }

  render() {
    const {tasks} = this.s

    return (
      <div className="component-models-destroy-event">
        {tasks && tasks.map(task =>
          <TaskRow key={task.cacheKey()} onDestroyed={this.tt.onDestroyed} task={task} />
        )}
      </div>
    )
  }

  onDestroyed = (args) =>
    this.setState({
      tasks: this.state.tasks.filter(task => task.id() != args.model.id())
    })
}))
