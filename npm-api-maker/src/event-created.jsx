import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerEventCreated extends React.Component {
  static propTypes = PropTypesExact({
    modelClass: PropTypes.func.isRequired,
    onCreated: PropTypes.func.isRequired
  })

  componentDidMount() {
    this.connect()
  }

  componentWillUnmount() {
    this.connectCreated.unsubscribe()
  }

  connect() {
    this.connectCreated = this.props.modelClass.connectCreated(this.props.onCreated)
  }

  render() {
    return null
  }
}
