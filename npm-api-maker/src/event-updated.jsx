const PropTypes = require("prop-types")
const PropTypesExact = require("prop-types-exact")
const React = require("react")

module.exports = class ApiMakerEventUpdated extends React.Component {
  static defaultProps = {
    active: true
  }

  static propTypes = PropTypesExact({
    active: PropTypes.bool.isRequired,
    model: PropTypes.object.isRequired,
    onUpdated: PropTypes.func.isRequired
  })

  componentDidMount() {
    this.connect()
  }

  componentWillUnmount() {
    this.connectUpdated.unsubscribe()
  }

  connect() {
    this.connectUpdated = this.props.model.connectUpdated((...args) => this.onUpdated(...args))
  }

  onUpdated(...args) {
    if (this.props.active) {
      this.props.onUpdated(...args)
    }
  }

  render() {
    return null
  }
}
