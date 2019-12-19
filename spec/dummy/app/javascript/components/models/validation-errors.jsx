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

  async loadUser(params) {
    const user = await User
      .ransack({id_eq: params.id})
      .preload("tasks.project")
      .first()

    this.setState({user, tasks: user.tasks().loaded()})
  }

  render() {
    const { tasks, user } = this.state

    return (
      <Layout className="component-models-validation-errors">
        {tasks && user && this.content()}
      </Layout>
    )
  }

  content() {
    const { tasks, user } = this.state

    return (
      <div className="content-container">
        <form onSubmit={e => this.onSubmit(e)}>
          <StringInput attribute="email" label="Email" model={user} />

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
              <StringInput
                attribute="name"
                id={`task_name_${task.id()}`}
                label="Name"
                name={`user[tasks_attributes][${task.uniqueKey()}][name]`}
                model={task}
                savingModel={user}
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
        <StringInput
          attribute="name"
          id={`project_name_${project.id()}`}
          label="Project name"
          model={project}
          name={`user[tasks_attributes][${task.uniqueKey()}][project_attributes][name]`}
          savingModel={user}
          wrapperClassName={`project-name-${project.id()}`}
        />
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
