import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"

export default class ApiMakerHistoryListener extends React.Component {
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
