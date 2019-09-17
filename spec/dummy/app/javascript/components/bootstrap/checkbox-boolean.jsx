export default class BootstrapCheckboxBoolean extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.loadTask()
  }

  async loadTask() {
    var params = Params.parse()
    var task = await Task.find(params.task_id)
    this.setState({task})
  }

  render() {
    return (
      <Layout>
        {this.state.task && this.content()}
      </Layout>
    )
  }

  content() {
    return (
      <div className="content-container">
        <Checkbox attribute="finished" model={this.state.task} />
      </div>
    )
  }
}
