export default class BootstrapCheckboxes extends React.PureComponent {
  state = {}

  componentDidMount() {
    this.loadAccount()
    this.loadTasks()
  }

  async loadAccount() {
    const params = Params.parse()
    const account = await Account.ransack({id_eq: params.account_id}).preload("tasks").first()
    this.setState({account})
  }

  async loadTasks() {
    const tasks = await Task.ransack().toArray()
    this.setState({tasks})
  }

  render() {
    return (
      <Layout>
        {this.state.account && this.state.tasks && this.content()}
      </Layout>
    )
  }

  content() {
    return (
      <div className="content-container">
        <form onSubmit={(e) => this.onSubmit(e)} ref="form">
          <Checkboxes
            defaultValue={this.state.account.tasks().loaded().map(task => task.id())}
            label="Choose tasks"
            name="account[task_ids]"
            options={this.state.tasks.map(task => [task.name(), task.id()])}
            />
          <input type="submit" value="Save" />
        </form>
      </div>
    )
  }

  onSubmit(e) {
    e.preventDefault()

    this.state.account.saveRaw(e.target).then(() => {
      console.log("Account was saved")
    }, (response) => {
      console.log("Account couldnt be saved")
    })
  }
}
