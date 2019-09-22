import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerEventUpdated extends React.Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onUpdated: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.connect()
  }

  componentWillUnmount() {
    this.connectUpdated.unsubscribe()
  }

  connect() {
    this.connectUpdated = this.props.model.connectUpdated(this.props.onUpdated)
  }

  render() {
    return ""
  }
}
