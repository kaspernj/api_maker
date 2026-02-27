import {digs} from "diggerize"
import EventModelClass from "@kaspernj/api-maker/build/event-model-class"
import Layout from "components/layout"
import React from "react"
import Task from "models/task.js"

export default class ModelsCreatedEvent extends React.PureComponent {
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
