import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import {memo, useMemo} from "react"
import useUpdatedEvent from "@kaspernj/api-maker/build/use-updated-event"

export default memo(shapeComponent(class ModelsUpdateEvent extends ShapeComponent {
  setup() {
    this.useStates({
      finishedTask: undefined
    })

    useMemo(() => {
      this.loadFinishedTask()
    }, [])

    useUpdatedEvent(this.s.finishedTask, this.tt.loadFinishedTask, {onConnected: this.tt.onConnected})
  }

  render() {
    const {connected, finishedTask} = this.state

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
