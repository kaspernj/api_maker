import classNames from "classnames"
import {digg, digs} from "diggerize"
import Input from "@kaspernj/api-maker/src/bootstrap/input"
import PropTypes from "prop-types"
import Select from "@kaspernj/api-maker/src/bootstrap/select"
import TranslatedCollections from "@kaspernj/api-maker/src/translated-collections"

export default class ComponentsTasksForm extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    task: PropTypes.instanceOf(Task).isRequired
  }

  priorityCollection = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  render() {
    const {onSubmit, priorityCollection} = digs(this, "onSubmit", "priorityCollection")
    const {className, task, ...restProps} = this.props
    const stateOptionsCollection = TranslatedCollections
      .get(Task, "state")
      .map((stateOption) => [digg(stateOption, "translation"), digg(stateOption, "value")])

    return (
      <form className={classNames("components-tasks-form", className)} onSubmit={onSubmit} {...restProps}>
        <Input attribute="name" model={task} />
        <Select attribute="state" includeBlank model={task} options={stateOptionsCollection} />
        <Select attribute="priority" includeBlank model={task} options={priorityCollection} />
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
