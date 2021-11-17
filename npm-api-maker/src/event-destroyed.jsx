const ModelEvents = require("./model-events.cjs")
const PropTypes = require("prop-types")
const propTypesExact = require("prop-types-exact")
const React = require("react")

export default class ApiMakerEventDestroyed extends React.PureComponent {
  static propTypes = propTypesExact({
    model: PropTypes.object.isRequired,
    onDestroyed: PropTypes.func.isRequired
  })

  componentDidMount () {
    this.connect()
  }

  componentWillUnmount () {
    if (this.connectDestroyed) {
      this.connectDestroyed.unsubscribe()
    }
  }

  connect () {
    this.connectDestroyed = ModelEvents.connectDestroyed(this.props.model, this.props.onDestroyed)
  }

  render () {
    return null
  }
}
