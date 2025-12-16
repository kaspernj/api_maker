import {Account, Task} from "models"
import Checkboxes from "@kaspernj/api-maker/build/bootstrap/checkboxes"
import Layout from "components/layout"
import Params from "@kaspernj/api-maker/build/params"
import React from "react"

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
        <form onSubmit={this.onSubmit} ref={this.props.formRef}>
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

  onSubmit = async (e) => {
    e.preventDefault()

    try {
      await this.state.account.saveRaw(e.target)
      console.log("Account was saved")
    } catch (error) {
      console.log(`Account couldnt be saved: ${e.message}`)
    }
  }
}
