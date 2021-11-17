const EventEmitter = require("events")
const PropTypes = require("prop-types")
const React = require("react")

export default class ApiMakerEventEmitterListener extends React.PureComponent {
  static propTypes = {
    events: PropTypes.instanceOf(EventEmitter).isRequired,
    event: PropTypes.string.isRequired,
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

  render () {
    return null
  }
}
