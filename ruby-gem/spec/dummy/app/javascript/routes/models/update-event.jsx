import {digg, digs} from "diggerize"
import {EventUpdated} from "@kaspernj/api-maker"

export default class ComponentsTasksForm extends React.Component {
  state = {}

  componentDidMount() {
    this.loadTasks()
  }

  render() {
    const {connected, finishedTask} = this.state

    return (
      <div className="routes-tasks-filter">
        {finishedTask &&
          <div className="finished-task-container" data-connected={connected}>
            <div id="finished-task-name">
              {finishedTask.name()}
            </div>
            <EventUpdated
              onConnected={() => this.setState({connected: true})}
              model={task}
              onUpdated={this.loadFinishedTask}
            />
          </div>
        }
      </div>
    )
  }

  loadFinishedTask = async() => {
    const finishedTask = await Task.ransack({finished_eq: true}).first()

    this.setState({finishedTask})
  }
}
