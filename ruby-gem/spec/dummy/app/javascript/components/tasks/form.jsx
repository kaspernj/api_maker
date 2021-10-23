import {digg, digs} from "diggerize"
import {Input, Select} from "@kaspernj/api-maker-bootstrap"
import TranslatedCollections from "@kaspernj/api-maker/src/translated-collections.cjs"

export default class ComponentsTasksForm extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    task: PropTypes.instanceOf(Task).isRequired
  }

  render() {
    const {onSubmit} = digs(this, "onSubmit")
    const {className, task, ...restProps} = this.props
    const stateOptionsCollection = TranslatedCollections
      .get(Task, "state")
      .map((stateOption) => [digg(stateOption, "translation"), digg(stateOption, "value")])

    return (
      <form className={classNames("components-tasks-form", className)} onSubmit={onSubmit} {...restProps}>
        <Input attribute="name" model={task} />
        <Select attribute="state" includeBlank model={task} options={stateOptionsCollection} />
        <input type="submit" />
      </form>
    )
  }

  onSubmit = async (e) => {
    e.preventDefault()

    const {task} = digs(this.props, "task")
    const form = digg(e, "target")

    try {
      await task.saveRaw(form)
      FlashMessage.success("The task was saved")
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }
}
