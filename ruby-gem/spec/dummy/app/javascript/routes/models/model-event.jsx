import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import {memo, useMemo} from "react"
import React from "react"
import {Task} from "models.js"
import useModelEvent from "@kaspernj/api-maker/build/use-model-event.js"

export default memo(shapeComponent(class ModelsModelEvent extends ShapeComponent {
  setup() {
    this.useStates({
      connected: null,
      eventCounts: {},
      tasks: []
    })

    useMemo(() => {
      this.loadTasks()
    }, [])

    useModelEvent(this.s.tasks, "test_model_event", this.tt.onEvent, {onConnected: this.tt.onConnected})
  }

  render() {
    const {connected, eventCounts, tasks} = this.s

    return (
      <div className="component-models-model-event" data-connected={connected}>
        {tasks.map((task) =>
          <div className="task-event-count" data-task-id={task.id()} key={task.id()}>
            {eventCounts[task.id()] || 0}
          </div>
        )}
      </div>
    )
  }

  onConnected = () => this.setState({connected: true})

  onEvent = ({args, model}) => {
    let taskId = args.task_id

    if (!taskId && model) {
      taskId = model.id()
    }

    if (!taskId) return

    this.setState({
      eventCounts: {
        ...this.s.eventCounts,
        [taskId]: (this.s.eventCounts[taskId] || 0) + 1
      }
    })
  }

  loadTasks = async() => {
    const tasks = await Task.ransack({s: "id asc"}).toArray()

    this.setState({tasks: tasks.slice(0, 2)})
  }
}))
