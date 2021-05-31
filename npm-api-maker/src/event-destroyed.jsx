const PropTypes = require("prop-types")
const PropTypesExact = require("prop-types-exact")
const React = require("react")

export default class ApiMakerEventDestroyed extends React.Component {
  static propTypes = PropTypesExact({
    model: PropTypes.object.isRequired,
    onDestroyed: PropTypes.func.isRequired
  })

  componentDidMount() {
    this.connect()
  }

  componentWillUnmount() {
    if (this.connectDestroyed) {
      this.connectDestroyed.unsubscribe()
    }
  }

  connect() {
    this.connectDestroyed = this.props.model.connectDestroyed(this.props.onDestroyed)
  }

  render() {
    return null
  }
}
