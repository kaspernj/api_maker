import Devise from "@kaspernj/api-maker/src/devise"
import Input from "@kaspernj/api-maker/src/bootstrap/input"

export default class BootstrapStringInputFile extends React.PureComponent {
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
          <Input attribute="image" defaultValue={null} label="Image" model={user} type="file" />
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
