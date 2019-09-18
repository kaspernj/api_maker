export default class BootstrapCheckboxes extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.loadAccount()
    this.loadTasks()
  }

  async loadAccount() {
    var params = Params.parse()
    var account = await Account.ransack({id_eq: params.account_id}).preload("tasks").first()
    this.setState({account})
  }

  async loadTasks() {
    var tasks = await Task.ransack().toArray()
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
    console.log(this.state.account)

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

    var formData = new FormData(this.refs.form)

    this.state.account.saveRaw(formData).then(() => {
      console.log("Account was saved")
    }, (response) => {
      console.log("Account couldnt be saved")
    })
  }
}
