import DisplayNotification from "shared/display-notification"
import Params from "shared/params"

import Project from "api-maker/models/project"
import Task from "api-maker/models/task"
import User from "api-maker/models/user"

import Select from "api-maker/bootstrap/select"
import StringInput from "api-maker/bootstrap/string-input"

export default class ModelsValidationErrors extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    const params = Params.parse()
    this.loadProjects()

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

  async loadProjects() {
    const projects = await Project.ransack({s: "name"}).toArray()
    this.setState({projects})
  }

  async loadUser(params) {
    const user = await User
      .ransack({id_eq: params.id})
      .preload("tasks")
      .first()

    this.setState({user, tasks: user.tasks().loaded()})
  }

  render() {
    var { projects, tasks, user } = this.state

    return (
      <Layout className="component-models-validation-errors">
        {projects && tasks && user && this.content()}
      </Layout>
    )
  }

  content() {
    const { projects, tasks, user } = this.state

    return (
      <div className="content-container">
        <form onSubmit={e => this.onSubmit(e)}>
          <StringInput attribute="email" label="Email" model={user} />

          {tasks.map(task =>
            <div className="my-4" key={task.uniqueKey()}>
              <input
                defaultValue={task.id()}
                name={`user[tasks_attributes][${task.uniqueKey()}][id]`}
                type="hidden"
              />

              <h1>Task</h1>
              <StringInput
                attribute="name"
                id={`task_name_${task.id()}`}
                label="Name"
                name={`user[tasks_attributes][${task.uniqueKey()}][name]`}
                model={task}
                savingModel={user}
                uniqueKey={task.uniqueKey()}
                wrapperClassName={`task-name-${task.id()}`}
              />
              <Select
                attribute="projectId"
                id={`task_project_id_${task.id()}`}
                includeBlank
                label="Project"
                name={`user[tasks_attributes][${task.uniqueKey()}][project_id]`}
                model={task}
                options={projects.map(project => [project.name(), project.id()])}
                savingModel={user}
                uniqueKey={task.uniqueKey()}
              />
            </div>
          )}
          <input type="submit" />
        </form>
      </div>
    )
  }

  async onSubmit(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const { user } = this.state

    try {
      await user.saveRaw(formData)
    } catch(error) {
      DisplayNotification.error(error)
    }
  }
}
