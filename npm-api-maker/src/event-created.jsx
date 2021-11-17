const debounce = require("debounce")
const ModelEvents = require("./model-events.cjs")
const PropTypes = require("prop-types")
const propTypesExact = require("prop-types-exact")
const React = require("react")

export default class ApiMakerEventCreated extends React.PureComponent {
  static defaultProps = {
    active: true
  }

  static propTypes = propTypesExact({
    active: PropTypes.bool.isRequired,
    debounce: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number
    ]),
    modelClass: PropTypes.func.isRequired,
    onCreated: PropTypes.func.isRequired
  })

  componentDidMount () {
    this.connect()
  }

  componentWillUnmount () {
    if (this.connectCreated) {
      this.connectCreated.unsubscribe()
    }
  }

  connect () {
    this.connectCreated = ModelEvents.connectCreated(this.props.modelClass, (...args) => this.onCreated(...args))
  }

  debounce () {
    if (!this.debounceInstance) {
      if (typeof this.props.debounce == "number") {
        this.debounceInstance = debounce(this.props.onCreated, this.props.debounce)
      } else {
        this.debounceInstance = debounce(this.props.onCreated)
      }
    }

    return this.debounceInstance
  }

  onCreated (...args) {
    if (!this.props.active) {
      return
    }

    if (this.props.debounce) {
      this.debounce()(...args)
    } else {
      this.props.onCreated(...args)
    }
  }

  render () {
    return null
  }
}
