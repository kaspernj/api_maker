export default class BootstrapCheckboxes extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.loadAccount()
  }

  async loadAccount() {
    var params = Params.parse()
    var account = Account.ransack({id_eq: params.account_id}).first()
    this.setState({account})
  }

  render() {
    return (
      <Layout>
        {this.state.account && this.content()}
      </Layout>
    )
  }

  content() {
    return (
      <form onSubmit={(e) => this.onSubmit(e)} ref="form">
        <Checkboxes model={this.state.account} />
        <input type="submit" value="Save" />
      </form>
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
