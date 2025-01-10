import Checkbox from "@kaspernj/api-maker/build/bootstrap/checkbox"
import {digg} from "diggerize"
import FlashMessage from "@kaspernj/api-maker/build/flash-message"
import Input from "@kaspernj/api-maker/build/bootstrap/input"
import Layout from "components/layout"
import Params from "@kaspernj/api-maker/build/params"
import React from "react"
import Select from "@kaspernj/api-maker/build/bootstrap/select"
import models from "@kaspernj/api-maker/build/models"

const {Account, Project, Task, User} = models

export default class ModelsValidationErrors extends React.PureComponent {
  // This ensures that it doesn't crash if the checkbox is passed an inputRef
  checkboxInputRef = React.createRef()
  state = {}

  componentDidMount() {
    const params = Params.parse()
    this.loadAccounts()

    if (params.id) {
      this.loadUser(params)
    } else {
      const tasks = [
        new Task(),
        new Task(),
        new Task()
      ]

      this.setState({
        user: new User(),
        tasks: tasks
      })
    }
  }

  async loadAccounts() {
    const accounts = await Account.ransack({s: "name"}).toArray()
    this.setState({accounts})
  }

  async loadUser(params) {
    const user = await User
      .ransack({id_eq: params.id})
      .preload("tasks.project")
      .first()

    this.setState({user, tasks: user.tasks().loaded()})
  }

  render() {
    const { accounts, tasks, user } = this.state

    return (
      <Layout className="component-models-validation-errors">
        {accounts && tasks && user && this.content()}
      </Layout>
    )
  }

  content() {
    const { tasks, user } = this.state

    return (
      <div className="content-container">
        <form onSubmit={e => this.onSubmit(e)}>
          <Input attribute="email" label="Email" model={user} />
          <Input attribute="password" defaultValue="" label="Password" model={user} wrapperClassName="user-password-input" />

          {tasks.map(task =>
            <div className="my-4" key={task.uniqueKey()}>
              {task.isPersisted() &&
                <input
                  defaultValue={task.id()}
                  name={`user[tasks_attributes][${task.uniqueKey()}][id]`}
                  type="hidden"
                />
              }

              <h1>Task</h1>
              <Input
                attribute="name"
                id={`task_name_${task.id()}`}
                label="Name"
                name={`user[tasks_attributes][${task.uniqueKey()}][name]`}
                model={task}
                wrapperClassName={`task-name-${task.id()}`}
              />
              {this.projectFieldsForTask(user, task)}
            </div>
          )}
          <input type="submit" />
        </form>
      </div>
    )
  }

  projectFieldsForTask(user, task) {
    const { accounts } = this.state
    let project

    if (task.project()) {
      project = task.project()
    } else {
      project = new Project()
    }

    return (
      <div className="project-fields-for-task">
        <h2>Project</h2>
        {project.isPersisted() &&
          <input
            defaultValue={project.id()}
            name={`user[tasks_attributes][${task.uniqueKey()}][project_attributes][id]`}
            type="hidden"
          />
        }
        <Input
          attribute="name"
          id={`project_name_${project.id()}`}
          label="Project name"
          model={project}
          name={`user[tasks_attributes][${task.uniqueKey()}][project_attributes][name]`}
          wrapperClassName={`project-name-${project.id()}`}
        />
        <Select
          attribute="accountId"
          id={`project_account_${project.id()}`}
          includeBlank
          label="Account"
          model={project}
          name={`user[tasks_attributes][${task.uniqueKey()}][project_attributes][account_id]`}
          options={accounts.map(account => [account.name(), account.id()])}
          wrapperClassName={`project-account-${project.id()}`}
        />
        <Checkbox
          attribute="illegal"
          id={`project_illegal_${project.id()}`}
          inputRef={digg(this, "checkboxInputRef")}
          label="Illegal"
          model={project}
          name={`user[tasks_attributes][${task.uniqueKey()}][project_attributes][illegal]`}
          wrapperClassName={`project-illegal-${project.id()}`}
        />
      </div>
    )
  }

  async onSubmit(e) {
    e.preventDefault()

    const { user } = this.state

    try {
      await user.saveRaw(e.target)
    } catch(error) {
      FlashMessage.errorResponse(error)
    }
  }
}
