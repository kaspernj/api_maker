const debounce = require("debounce")
const ModelEvents = require("./model-events.cjs")
const PropTypes = require("prop-types")
const propTypesExact = require("prop-types-exact")
const React = require("react")

export default class ApiMakerEventUpdated extends React.PureComponent {
  static defaultProps = {
    active: true
  }

  static propTypes = propTypesExact({
    active: PropTypes.bool.isRequired,
    debounce: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number
    ]),
    model: PropTypes.object.isRequired,
    onConnected: PropTypes.func,
    onUpdated: PropTypes.func.isRequired
  })

  constructor (props) {
    super(props)
    this.onConnected = this.onConnected.bind(this)
  }

  componentDidMount () {
    this.connect()
  }

  componentWillUnmount () {
    if (this.connectUpdated) {
      this.connectUpdated.unsubscribe()
    }

    if (this.onConnectedListener) {
      this.connectUpdated.events.removeListener("connected", this.onConnected)
    }
  }

  connect () {
    const {model, onConnected} = this.props

    this.connectUpdated = ModelEvents.connectUpdated(model, (...args) => this.onUpdated(...args))

    if (onConnected) {
      this.connectUpdated.events.addListener("connected", this.onConnected)
    }
  }

  debounce () {
    if (!this.debounceInstance) {
      if (typeof this.props.debounce == "number") {
        this.debounceInstance = debounce(this.props.onUpdated, this.props.debounce)
      } else {
        this.debounceInstance = debounce(this.props.onUpdated)
      }
    }

    return this.debounceInstance
  }

  onConnected () {
    this.props.onConnected()
  }

  onUpdated (...args) {
    if (!this.props.active) {
      return
    }

    if (this.props.debounce) {
      this.debounce()(...args)
    } else {
      this.props.onUpdated(...args)
    }
  }

  render () {
    return null
  }
}
