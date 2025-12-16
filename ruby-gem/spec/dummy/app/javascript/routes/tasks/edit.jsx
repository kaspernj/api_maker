import {digs} from "diggerize"
import Form from "components/tasks/form.jsx"
import Layout from "components/layout"
import React from "react"
import Shape from "set-state-compare/src/shape"
import {Task} from "models.js"

export default class RoutesTasksEdit extends React.PureComponent {
  taskId = this.props.match.params.id

  shape = new Shape(this, {
    task: undefined
  })

  componentDidMount() {
    const {taskId} = digs(this, "taskId")

    if (taskId) {
      this.loadTask()
    } else {
      this.shape.set({
        task: new Task()
      })
    }
  }

  async loadTask() {
    const {taskId} = digs(this, "taskId")
    const task = await Task.find(taskId)

    this.shape.set({task})
  }

  render() {
    const {task} = digs(this.shape, "task")

    return (
      <Layout>
        {task &&
          <Form task={task} />
        }
      </Layout>
    )
  }
}
