import EventEmitter from "events"
import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerEventEmitterListener extends React.PureComponent {
  static propTypes = {
    event: PropTypes.string.isRequired,
    events: PropTypes.instanceOf(EventEmitter).isRequired,
    onCalled: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.onCalled = this.onCalled.bind(this)
  }

  componentDidMount () {
    this.props.events.addListener(this.props.event, this.onCalled)
  }

  componentWillUnmount () {
    this.props.events.removeListener(this.props.event, this.onCalled)
  }

  onCalled (...args) {
    this.props.onCalled.apply(null, ...args)
  }

  render = () => null
}
