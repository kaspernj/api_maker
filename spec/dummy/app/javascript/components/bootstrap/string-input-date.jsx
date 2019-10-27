import Devise from "api-maker/devise"

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
        {this.state.user && this.content()}
      </Layout>
    )
  }

  content() {
    var { user } = this.state

    return (
      <div className="content-container">
        <form onSubmit={(e) => this.onSubmit(e)} ref="form">
          <StringInput attribute="birthdayAt" label="Birthday" model={user} type="date" />
          <input type="submit" value="Save" />
        </form>
      </div>
    )
  }

  onSubmit(e) {
    e.preventDefault()

    var formData = new FormData(this.refs.form)
    var { user } = this.state

    user.saveRaw(formData).then(() => {
      console.log("User was saved")
    }, (response) => {
      console.log("Error!")
    })
  }
}
