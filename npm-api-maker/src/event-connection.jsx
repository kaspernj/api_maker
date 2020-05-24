import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerEventConnection extends React.Component {
  static propTypes = PropTypesExact({
    model: PropTypes.object.isRequired,
    event: PropTypes.string.isRequired,
    onCall: PropTypes.func.isRequired
  })

  componentDidMount() {
    this.subscription = this.props.model.connect(this.props.event, this.props.onCall)
  }

  componentWillUnmount() {
    if (this.subscription)
      this.subscription.unsubscribe()
  }

  render() {
    return ""
  }
}
