import Devise from "@kaspernj/api-maker/src/devise"

export default class BootstrapStringInputDatetimeLocal extends React.PureComponent {
  state = {
    user: Devise.currentUser()
  }

  render() {
    return (
      <Layout>
        {this.state.user && this.content()}
      </Layout>
    )
  }

  content() {
    const { user } = this.state

    return (
      <div className="content-container">
        <form onSubmit={this.onSubmit}>
          <Input attribute="birthdayAt" label="Birthday" model={user} type="date" />
          <input type="submit" value="Save" />
        </form>
      </div>
    )
  }

  onSubmit = (e) => {
    e.preventDefault()

    const { user } = this.state

    user.saveRaw(e.target).then(() => {
      console.log("User was saved")
    }, (response) => {
      console.log("Error!")
    })
  }
}
