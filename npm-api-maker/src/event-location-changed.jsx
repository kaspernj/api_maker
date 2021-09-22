export default class EventLocationChanged extends React.PureComponent {
  static propTypes = {
    history: PropTypes.object.isRequired,
    onChanged: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.appHistoryUnlisten = this.props.history.listen(this.props.onChanged)
  }

  componentWillUnmount() {
    this.appHistoryUnlisten()
  }

  render() {
    return null
  }
}
