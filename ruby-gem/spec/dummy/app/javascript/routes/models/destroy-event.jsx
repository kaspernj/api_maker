import { EventDestroyed } from "@kaspernj/api-maker"
import React from "react"

export default class ModelsDestroyEvent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      destroyedEventsCount: 0
    }
  }

  async componentDidMount() {
    const tasks = await Task.ransack().toArray()
    this.setState({tasks})
  }

  render() {
    const { destroyedEventsCount, showDestroyedCounter, tasks } = this.state

    return (
      <div className="component-models-destroy-event">
        {tasks && tasks.map(task =>
          <div className="task-row" data-task-id={task.id()} key={task.cacheKey()}>
            <EventDestroyed model={task} onDestroyed={(args) => this.onDestroyed(args)} />
            {showDestroyedCounter && <EventDestroyed model={task} onDestroyed={() => this.onDestroyedForCounter()} />}
            {task.id()}
          </div>
        )}

        <button className="show-destroyed-counter-button" onClick={(e) => this.onShowDestroyedCounterClicked(e)} />

        {showDestroyedCounter &&
          <div className="destroyed-counter">
            {destroyedEventsCount}
          </div>
        }
      </div>
    )
  }

  onShowDestroyedCounterClicked(e) {
    e.preventDefault()

    this.setState({showDestroyedCounter: true})
  }

  onDestroyed(args) {
    this.setState({
      tasks: this.state.tasks.filter(task => task.id() != args.model.id())
    })
  }

  onDestroyedForCounter() {
    this.setState((prevState) => ({destroyedEventsCount: prevState.destroyedEventsCount + 1}))
  }
}
