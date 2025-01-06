import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import {memo} from "react"
import useUpdatedEvent from "@kaspernj/api-maker/build/use-updated-event"

export default memo(shapeComponent(class ModelsUpdateEvent extends ShapeComponent {
  setup() {
    this.useStates({
      finishedTask: undefined
    })

    useUpdatedEvent(this.s.finishedTask, this.tt.this.loadFinishedTask, {onConnected: this.tt.onConnected})
  }

  componentDidMount() {
    this.loadFinishedTask()
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
