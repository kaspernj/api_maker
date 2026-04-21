import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import {memo, useEffect} from "react"
import React from "react"
import {Task} from "models.js"
import useUpdatedEvent from "@kaspernj/api-maker/build/use-updated-event.js"

/** @typedef {object} ModelsUpdateEventProps */

/**
 * @typedef {object} ModelsUpdateEventState
 * @property {boolean | null} connected
 * @property {Task[]} finishedTasks
 */

/** @augments {ShapeComponent<ModelsUpdateEventProps, ModelsUpdateEventState>} */
class ModelsUpdateEvent extends ShapeComponent {
  state = /** @type {ModelsUpdateEventState} */ ({
    connected: null,
    finishedTasks: []
  })

  setup() {
    useEffect(() => {
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
}

export default memo(shapeComponent(ModelsUpdateEvent))
