import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerEventDestroyed extends React.Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onDestroyed: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.connect()
  }

  componentWillUnmount() {
    this.connectDestroyed.unsubscribe()
  }

  connect() {
    this.connectDestroyed = this.props.model.connectDestroyed(this.props.onDestroyed)
  }

  render() {
    return ""
  }
}
