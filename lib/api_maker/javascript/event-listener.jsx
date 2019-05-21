import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerEventListener extends React.Component {
  static callEvent(target, eventName, args = []) {
    let event = document.createEvent("Event")
    event.initEvent(eventName, false, true)
    target.dispatchEvent(event, args)
  }

  static propTypes = {
    event: PropTypes.string.isRequired,
    onCalled: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.onCalled = this.onCalled.bind(this)

    if (!this.props.target)
      throw new Error("'target' was expected but not given")
  }

  componentWillMount() {
    this.props.target.addEventListener(this.props.event, this.onCalled)
  }

  componentWillUnmount() {
    this.props.target.removeEventListener(this.props.event, this.onCalled)
  }

  onCalled(...args) {
    this.props.onCalled.apply(null, ...args)
  }

  render() {
    return ""
  }
}
