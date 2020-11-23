import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerEventUpdated extends React.Component {
  static defaultProps = {
    active: true
  }

  static propTypes = PropTypesExact({
    active: PropTypes.bool.isRequired,
    model: PropTypes.object.isRequired,
    onUpdated: PropTypes.func.isRequired
  })

  componentDidMount() {
    this.connect()
  }

  componentWillUnmount() {
    this.connectUpdated.unsubscribe()
  }

  connect() {
    this.connectUpdated = this.props.model.connectUpdated((...args) => this.onUpdated(...args))
  }

  onUpdated(...args) {
    if (this.props.active) {
      this.props.onUpdated(...args)
    }
  }

  render() {
    return null
  }
}
