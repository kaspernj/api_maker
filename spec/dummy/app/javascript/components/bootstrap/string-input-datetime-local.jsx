export default class BootstrapStringInputDatetimeLocal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.loadTask()
  }

  async loadTask() {
    const params = Params.parse()
    const task = await Task.find(params.task_id)
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
    const { task } = this.state

    return (
      <div className="content-container">
        <form onSubmit={(e) => this.onSubmit(e)} ref="form">
          <StringInput attribute="createdAt" model={task} type="datetime-local" />
          <input type="submit" value="Save" />
        </form>
      </div>
    )
  }

  onSubmit(e) {
    e.preventDefault()

    const formData = new FormData(this.refs.form)
    const { task } = this.state

    task.saveRaw(formData).then(() => {
      console.log("Task was saved")
    }, (response) => {
      console.log("Error!")
    })
  }
}
