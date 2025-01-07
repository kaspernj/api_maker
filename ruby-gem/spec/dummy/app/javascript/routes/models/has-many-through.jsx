import {digg, digs} from "diggerize"
import Params from "@kaspernj/api-maker/build/params"

export default class ModelsHasManyAs extends React.PureComponent {
  params = Params.parse()
  state = {
    account: undefined,
    tasks: undefined
  }
  accountId = digg(this, "params", "account_id")

  componentDidMount() {
    this.loadAccount()
  }

  async loadAccount() {
    const {accountId} = digs(this, "accountId")
    const account = await Account.find(accountId)
    const tasks = await account.tasks().toArray()

    this.setState({
      account,
      tasks
    })
  }

  render() {
    const {tasks} = digs(this.state, "tasks")

    return (
      <div className="routes-models-has-many-through">
        <div>
          Tasks count: {tasks !== undefined && tasks.length}
        </div>
        {tasks && tasks.map((task) =>
          <div className="task-container" data-task-id={task.id()} key={task.id()}>
            {task.name()}
          </div>
        )}
      </div>
    )
  }
}
