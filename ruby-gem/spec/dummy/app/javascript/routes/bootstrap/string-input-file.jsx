import Devise from "@kaspernj/api-maker/dist/devise"
import Input from "@kaspernj/api-maker/dist/bootstrap/input"
import Layout from "components/layout"
import React from "react"

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

  onSubmit = async (e) => {
    e.preventDefault()

    const {user} = this.state

    try {
      await user.saveRaw(e.target)
      console.log("User was saved")
    } catch (error) {
      console.log("Error!", {error})
    }
  }
}
