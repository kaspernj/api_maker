import { digs } from "@kaspernj/object-digger"
import { EventModelClass } from "@kaspernj/api-maker"
import { Task } from "api-maker/models"
import React from "react"

export default class ModelsCreatedEvent extends React.Component {
  state = {
    eventData: undefined
  }

  render() {
    const { eventData } = digs(this.state, "eventData")

    return (
      <Layout className="component-models-created-event">
        <EventModelClass event="test_model_class_event" modelClass={Task} onCall={args => this.onCall(args)} />

        <div className="event-data">
          {JSON.stringify(eventData)}
        </div>
      </Layout>
    )
  }

  onCall(args) {
    this.setState({
      eventData: args
    })
  }
}
