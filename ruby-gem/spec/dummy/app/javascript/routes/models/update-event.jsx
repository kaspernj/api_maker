import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import {memo, useMemo} from "react"
import models from "@kaspernj/api-maker/build/models"
import React from "react"
import useUpdatedEvent from "@kaspernj/api-maker/build/use-updated-event"

const {Task} = models

export default memo(shapeComponent(class ModelsUpdateEvent extends ShapeComponent {
  setup() {
    this.useStates({
      connected: null,
      finishedTask: undefined
    })

    useMemo(() => {
      this.loadFinishedTask()
    }, [])

    useUpdatedEvent(this.s.finishedTask, this.tt.loadFinishedTask, {onConnected: this.tt.onConnected})
  }

  render() {
    const {connected, finishedTask} = this.s

    return (
      <div className="routes-models-update-event">
        {finishedTask &&
          <div className="finished-task-container" data-connected={connected}>
            <div className="finished-task-name">
              {finishedTask.name()}
            </div>
          </div>
        }
      </div>
    )
  }

  onConnected = () => this.setState({connected: true})

  loadFinishedTask = async() => {
    const finishedTask = await Task.ransack({finished_eq: true}).first()

    this.setState({finishedTask})
  }
}))
