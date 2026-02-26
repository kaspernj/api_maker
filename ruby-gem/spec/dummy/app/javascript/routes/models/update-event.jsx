import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import {memo, useMemo} from "react"
import React from "react"
import {Task} from "models.js"
import useUpdatedEvent from "@kaspernj/api-maker/build/use-updated-event.js"

export default memo(shapeComponent(class ModelsUpdateEvent extends ShapeComponent {
  setup() {
    this.useStates({
      connected: null,
      finishedTasks: []
    })

    useMemo(() => {
      this.loadFinishedTasks()
    }, [])

    useUpdatedEvent(this.s.finishedTasks, this.tt.loadFinishedTasks, {onConnected: this.tt.onConnected})
  }

  render() {
    const {connected, finishedTasks} = this.s

    return (
      <div className="routes-models-update-event">
        {finishedTasks.length > 0 &&
          <div className="finished-task-container" data-connected={connected}>
            {finishedTasks.map((task) =>
              <div className="finished-task-name" data-task-id={task.id()} key={task.id()}>
                {task.name()}
              </div>
            )}
          </div>
        }
      </div>
    )
  }

  onConnected = () => this.setState({connected: true})

  loadFinishedTasks = async() => {
    const finishedTasks = await Task
      .ransack({finished_eq: true, s: "id asc"})
      .toArray()

    this.setState({finishedTasks: finishedTasks.slice(0, 2)})
  }
}))
