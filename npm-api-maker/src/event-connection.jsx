import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerEventConnection extends React.Component {
  static defaultProps = {
    active: true
  }

  static propTypes = PropTypesExact({
    active: PropTypes.bool.isRequired,
    model: PropTypes.object.isRequired,
    event: PropTypes.string.isRequired,
    onCall: PropTypes.func.isRequired
  })

  componentDidMount() {
    this.subscription = this.props.model.connect(this.props.event, (...args) => this.onCall(...args))
  }

  componentWillUnmount() {
    if (this.subscription)
      this.subscription.unsubscribe()
  }

  render() {
    return ""
  }

  onCall(...args) {
    if (this.props.active) {
      this.props.onCall(...args)
    }
  }
}
