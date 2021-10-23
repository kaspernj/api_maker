import {digs} from "diggerize"
import Form from "components/tasks/form"
import {Shape} from "set-state-compare"

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
