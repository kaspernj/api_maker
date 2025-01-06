import {digs} from "diggerize"
import EventModelClass from "@kaspernj/api-maker/src/event-model-class"
import React from "react"
import {Task} from "@kaspernj/api-maker/src/models"

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
