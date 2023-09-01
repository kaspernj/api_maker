import ModelEvents from "./model-events.mjs"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerEventModelClass extends React.PureComponent {
  static propTypes = propTypesExact({
    event: PropTypes.string.isRequired,
    modelClass: PropTypes.func.isRequired,
    onCall: PropTypes.func.isRequired
  })

  componentDidMount () {
    this.connect()
  }

  componentWillUnmount () {
    if (this.connection) {
      this.connection.unsubscribe()
    }
  }

  connect () {
    this.connection = ModelEvents.connectModelClass(this.props.modelClass, this.props.event, this.props.onCall)
  }

  render = () => null
}
