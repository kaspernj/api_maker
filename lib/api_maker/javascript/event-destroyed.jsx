import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerEventDestroyed extends React.Component {
  static propTypes = PropTypesExact({
    model: PropTypes.object.isRequired,
    onDestroyed: PropTypes.func.isRequired
  })

  componentDidMount() {
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
