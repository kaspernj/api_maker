const ModelEvents = require("./model-events.cjs")
const PropTypes = require("prop-types")
const propTypesExact = require("prop-types-exact")
const React = require("react")

export default class ApiMakerEventConnection extends React.PureComponent {
  static defaultProps = {
    active: true
  }

  static propTypes = propTypesExact({
    active: PropTypes.bool.isRequired,
    model: PropTypes.object.isRequired,
    event: PropTypes.string.isRequired,
    onCall: PropTypes.func.isRequired
  })

  componentDidMount () {
    this.subscription = ModelEvents.connect(this.props.model, this.props.event, (...args) => this.onCall(...args))
  }

  componentWillUnmount () {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  render () {
    return null
  }

  onCall (...args) {
    if (this.props.active) {
      this.props.onCall(...args)
    }
  }
}
