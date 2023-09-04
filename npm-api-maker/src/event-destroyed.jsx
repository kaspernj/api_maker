import ModelEvents from "./model-events.mjs"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerEventDestroyed extends React.PureComponent {
  static propTypes = propTypesExact({
    model: PropTypes.object.isRequired,
    onDestroyed: PropTypes.func.isRequired
  })

  componentDidMount () {
    this.connect()
  }

  componentWillUnmount () {
    if (this.connectDestroyed) {
      this.connectDestroyed.unsubscribe()
    }
  }

  connect () {
    this.connectDestroyed = ModelEvents.connectDestroyed(this.props.model, this.props.onDestroyed)
  }

  render = () => null
}
