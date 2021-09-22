const PropTypes = require("prop-types")
const PropTypesExact = require("prop-types-exact")

export default class ApiMakerHistoryListener extends React.PureComponent {
  static propTypes = PropTypesExact({
    onChanged: PropTypes.func.isRequired
  })

  componentDidMount() {
    this.unlisten = AppHistory.listen((location, action) => this.props.onChanged({location, action}))
  }

  componentWillUnmount() {
    this.unlisten()
  }

  render() {
    return null
  }
}
