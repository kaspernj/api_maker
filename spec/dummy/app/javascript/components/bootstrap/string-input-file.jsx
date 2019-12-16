import Devise from "api-maker/devise"

export default class BootstrapStringInputFile extends React.Component {
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
    const { user } = this.state

    return (
      <div className="content-container">
        <form onSubmit={(e) => this.onSubmit(e)} ref="form">
          <StringInput attribute="image" defaultValue={null} label="Image" model={user} type="file" />
          <input type="submit" value="Save" />
        </form>
      </div>
    )
  }

  onSubmit(e) {
    e.preventDefault()

    const formData = new FormData(this.refs.form)
    const { user } = this.state

    user.saveRaw(formData).then(() => {
      console.log("User was saved")
    }, (response) => {
      console.log("Error!")
    })
  }
}
