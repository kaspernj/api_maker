import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerEventListener extends React.Component {
  static callEvent(target, eventName, args = []) {
    let event = document.createEvent("Event")
    event.initEvent(eventName, false, true)
    target.dispatchEvent(event, args)
  }

  constructor(props) {
    super(props)
    this.onCalled = this.onCalled.bind(this)
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
