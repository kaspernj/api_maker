import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerEventListener extends React.PureComponent {
  static callEvent (target, eventName, args = []) {
    let event = document.createEvent("Event")
    event.initEvent(eventName, false, true)
    target.dispatchEvent(event, args)
  }

  static propTypes = propTypesExact({
    event: PropTypes.string.isRequired,
    onCalled: PropTypes.func.isRequired,
    target: PropTypes.object.isRequired
  })

  constructor (props) {
    super(props)
    this.onCalled = this.onCalled.bind(this)
  }

  componentDidMount () {
    this.props.target.addEventListener(this.props.event, this.onCalled)
  }

  componentWillUnmount () {
    this.props.target.removeEventListener(this.props.event, this.onCalled)
  }

  onCalled (...args) {
    this.props.onCalled.apply(null, args)
  }

  render = () => null
}
