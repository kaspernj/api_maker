import Collection from "./collection"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerEventUpdated extends React.Component {
  static propTypes = PropTypesExact({
    model: PropTypes.object.isRequired,
    onUpdated: PropTypes.func.isRequired,
    query: PropTypes.instanceOf(Collection)
  })

  componentDidMount() {
    this.connect()
  }

  componentWillUnmount() {
    this.connectUpdated.unsubscribe()
  }

  connect() {
    this.connectUpdated = this.props.model.connectUpdated({callback: this.props.onUpdated, query: this.props.query})
  }

  render() {
    return ""
  }
}
