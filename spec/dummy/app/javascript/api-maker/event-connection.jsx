import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerEventConnection extends React.Component {
  componentWillMount() {
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

ApiMakerEventConnection.propTypes = {
  model: PropTypes.object.isRequired,
  event: PropTypes.string.isRequired,
  onCall: PropTypes.func.isRequired
}
