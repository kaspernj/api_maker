import ModelEvents from "./model-events.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerEventConnection extends React.PureComponent {
  static defaultProps = {
    active: true
  }

  static propTypes = propTypesExact({
    active: PropTypes.bool.isRequired,
    model: PropTypes.object.isRequired,
    event: PropTypes.string.isRequired,
    onCall: PropTypes.func.isRequired
  })

  componentDidMount () {
    this.subscription = ModelEvents.connect(this.props.model, this.props.event, (...args) => this.onCall(...args))
  }

  componentWillUnmount () {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  render () {
    return null
  }

  onCall (...args) {
    if (this.props.active) {
      this.props.onCall(...args)
    }
  }
}
