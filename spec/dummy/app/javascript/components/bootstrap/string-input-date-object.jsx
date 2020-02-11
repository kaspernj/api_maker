export default class BootstrapStringInputDatetimeLocal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: Devise.currentUser()
    }
  }

  render() {
    return (
      <Layout>
        {this.content()}
      </Layout>
    )
  }

  content() {
    return (
      <div className="content-container">
        <form onSubmit={(e) => this.onSubmit(e)}>
          <StringInput defaultValue={new Date(2020, 1, )} id="date_object" label="Birthday" type="date" />
        </form>
      </div>
    )
  }
}
