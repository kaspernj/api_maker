import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerEventModelClass extends React.Component {
  static propTypes = PropTypesExact({
    event: PropTypes.string.isRequired,
    modelClass: PropTypes.func.isRequired,
    onCall: PropTypes.func.isRequired
  })

  componentDidMount() {
    this.connect()
  }

  componentWillUnmount() {
    this.connection.unsubscribe()
  }

  connect() {
    this.connection = this.props.modelClass.connect(this.props.event, this.props.onCall)
  }

  render() {
    return null
  }
}
