const PropTypes = require("prop-types")
const PropTypesExact = require("prop-types-exact")
const React = require("react")

export default class ApiMakerEventCreated extends React.Component {
  static propTypes = PropTypesExact({
    modelClass: PropTypes.func.isRequired,
    onCreated: PropTypes.func.isRequired
  })

  componentDidMount() {
    this.connect()
  }

  componentWillUnmount() {
    if (this.connectCreated) {
      this.connectCreated.unsubscribe()
    }
  }

  connect() {
    this.connectCreated = this.props.modelClass.connectCreated(this.props.onCreated)
  }

  render() {
    return null
  }
}
