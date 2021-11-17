const ModelEvents = require("./model-events.cjs")
const PropTypes = require("prop-types")
const PropTypesExact = require("prop-types-exact")
const React = require("react")

export default class ApiMakerEventModelClass extends React.PureComponent {
  static propTypes = PropTypesExact({
    event: PropTypes.string.isRequired,
    modelClass: PropTypes.func.isRequired,
    onCall: PropTypes.func.isRequired
  })

  componentDidMount () {
    this.connect()
  }

  componentWillUnmount () {
    if (this.connection) {
      this.connection.unsubscribe()
    }
  }

  connect () {
    this.connection = ModelEvents.connectModelClass(this.props.modelClass, this.props.event, this.props.onCall)
  }

  render () {
    return null
  }
}
