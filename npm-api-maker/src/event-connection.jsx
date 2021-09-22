const PropTypes = require("prop-types")
const PropTypesExact = require("prop-types-exact")
const React = require("react")

export default class ApiMakerEventConnection extends React.PureComponent {
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
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  render() {
    return null
  }

  onCall(...args) {
    if (this.props.active) {
      this.props.onCall(...args)
    }
  }
}
