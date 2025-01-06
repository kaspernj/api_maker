import Card from "@kaspernj/api-maker/build/bootstrap/card"
import {digg} from "diggerize"
import Params from "@kaspernj/api-maker/build/params"
import PropTypes from "prop-types"
import PureComponent from "set-state-compare/src/pure-component"
import SortLink from "@kaspernj/api-maker/build/bootstrap/sort-link"
import withQueryParams from "on-location-changed/src/with-query-params"

class BootstrapSortLink extends PureComponent {
  static propTypes = {
    queryParams: PropTypes.object
  }

  state = {
    currentHref: location.href,
    queryParamsString: JSON.stringify(digg(this, "props", "queryParams"))
  }

  componentDidMount() {
    this.loadTasks()
  }

  componentDidUpdate() {
    const queryParamsString = JSON.stringify(digg(this, "props", "queryParams"))

    if (this.state.queryParamsString != queryParamsString)
      this.setState({queryParamsString}, digg(this, "loadTasks"))
  }

  loadTasks = async () => {
    const params = Params.parse()
    const qParams = params.q ? JSON.parse(params.q) : {}
    const query = Task.ransack(qParams)
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

export default withQueryParams(BootstrapSortLink)
