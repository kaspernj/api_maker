import {digg, digs} from "diggerize"

export default class ComponentsTasksForm extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    task: PropTypes.instanceOf(Task).isRequired
  }

  render() {
    const {onSubmit} = digs(this, "onSubmit")
    const {className, ...restProps} = this.props

    return (
      <form className={classNames("components-tasks-form", className)} onSubmit={onSubmit}>
        <BootstrapInput attribute="name" model={task} />
        <input type="submit" />
      </form>
    )
  }

  onSubmit = async (e) => {
    const {task} = digs(this.props, "task")
    const form = digg(e, "target")

    try {
      await task.saveRaw(form)
    } catch (error) {
      FlashNotifications.errorResponse(error)
    }
  }
}
