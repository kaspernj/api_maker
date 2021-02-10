const PropTypes = require("prop-types")
const PropTypesExact = require("prop-types-exact")
const React = require("react")

module.exports = class ApiMakerEventCreated extends React.Component {
  static propTypes = PropTypesExact({
    modelClass: PropTypes.func.isRequired,
    onCreated: PropTypes.func.isRequired
  })

  componentDidMount() {
    this.connect()
  }

  componentWillUnmount() {
    this.connectCreated.unsubscribe()
  }

  connect() {
    this.connectCreated = this.props.modelClass.connectCreated(this.props.onCreated)
  }

  render() {
    return null
  }
}
