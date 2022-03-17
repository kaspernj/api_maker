import EventUpdated from "@kaspernj/api-maker/src/event-updated"

export default class ModelsUpdateEvent extends React.Component {
  state = {}

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
            <EventUpdated
              onConnected={this.onConnected}
              model={finishedTask}
              onUpdated={this.loadFinishedTask}
            />
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
}
