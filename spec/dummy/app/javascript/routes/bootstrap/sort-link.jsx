import Params from "shared/params"
import { Card, SortLink } from "@kaspernj/api-maker-bootstrap"

export default class BootstrapSortLink extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentHref: location.href
    }
  }

  componentDidMount() {
    this.loadTasks()
  }

  componentDidUpdate() {
    if (this.state.currentHref != location.href)
      this.setState({currentHref: location.href}, () => this.loadTasks())
  }

  async loadTasks() {
    const params = Params.parse()
    const query = Task.ransack(params.q)
    const result = await query.result()

    this.setState({
      tasks: result.models(),
      query
    })
  }

  render() {
    const { tasks } = this.state

    return (
      <Layout className="component-bootstrap-sort-link">
        {tasks && this.content()}
      </Layout>
    )
  }

  content() {
    const { query, tasks } = this.state

    return (
      <div className="content-container">
        <Card table>
          <thead>
            <tr>
              <th>
                <SortLink attribute="id" query={query} title="ID" />
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task =>
              <tr className="task-row" data-task-id={task.id()} key={task.cacheKey()}>
                <td>{task.id()}</td>
              </tr>
            )}
          </tbody>
        </Card>
      </div>
    )
  }
}
