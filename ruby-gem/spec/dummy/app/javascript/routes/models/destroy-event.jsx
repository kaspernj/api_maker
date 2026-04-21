import React, {memo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import {Task} from "models.js"
import useDestroyedEvent from "@kaspernj/api-maker/build/use-destroyed-event"

/** @typedef {{task: Task}} TaskRowProps */
/** @typedef {Record<string, never>} TaskRowState */
/** @augments {ShapeComponent<TaskRowProps, TaskRowState>} */
class TaskRow extends ShapeComponent {
  render() {
    const {task} = this.p

    return (
      <div className="task-row" data-task-id={task.id()}>
        {task.id()}
      </div>
    )
  }
}

const MemoizedTaskRow = memo(shapeComponent(TaskRow))

/** @typedef {Record<string, never>} ModelsDestroyEventProps */

/**
 * @typedef {object} ModelsDestroyEventState
 * @property {Task[] | null} tasks
 */

/** @augments {ShapeComponent<ModelsDestroyEventProps, ModelsDestroyEventState>} */
class ModelsDestroyEvent extends ShapeComponent {
  state = /** @type {ModelsDestroyEventState} */ ({
    tasks: null
  })

  async componentDidMount() {
    const tasks = await Task.ransack().toArray()
    this.setState({tasks})
  }

  render() {
    const {tasks} = this.s

    useDestroyedEvent(tasks || [], this.tt.onDestroyed)

    return (
      <div className="component-models-destroy-event">
        {tasks && tasks.map(task =>
          <MemoizedTaskRow key={task.cacheKey()} task={task} />
        )}
      </div>
    )
  }

  onDestroyed = (args) =>
    this.setState({
      tasks: this.s.tasks.filter(task => task.id() != args.model.id())
    })
}

export default memo(shapeComponent(ModelsDestroyEvent))
