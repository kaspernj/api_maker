import { EventCreated } from "@kaspernj/api-maker"
import React from "react"

export default class ModelsCreatedEvent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      eventsCount: 0,
      tasks: []
    }
  }

  render() {
    const { eventsCount, showEventsCounter, tasks } = this.state

    return (
      <Layout className="component-models-created-event">
        <EventCreated modelClass={Task} onCreated={args => this.onCreated(args)} />

        <table className="tasks-table">
          <tbody>
            {tasks.map(task =>
              <tr className="task-row" data-task-id={task.id()} key={task.cacheKey()}>
                <td className="id-column">
                  {task.id()}
                </td>
                <td className="name-column">
                  {task.name()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {showEventsCounter &&
          <div className="events-counter">
            <EventCreated modelClass={Task} onCreated={args => this.onCreatedForCounter(args)} />
            {eventsCount}
          </div>
        }
        {!showEventsCounter &&
          <button className="show-events-counter-button" onClick={(e) => this.onShowEventsCounterClicked(e)}>
            Show events counter
          </button>
        }
      </Layout>
    )
  }

  onCreated(args) {
    this.setState({
      tasks: this.state.tasks.concat([args.model])
    })
  }

  onCreatedForCounter() {
    this.setState((prevState) => ({eventsCount: prevState.eventsCount + 1}))
  }

  onShowEventsCounterClicked(e) {
    e.preventDefault()

    this.setState({showEventsCounter: true})
  }
}
