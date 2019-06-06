import Paginate from "api-maker/paginate"
import Params from "shared/params"
import React from "react"
import SortLink from "api-maker/sort-link"
import Task from "api-maker/models/task"

export default class ModelsPaginate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentHref: location.href
    }
  }

  componentWillMount() {
    this.loadTasks()
  }

  componentDidUpdate() {
    if (this.state.currentHref != location.href)
      this.loadTasks()
  }

  loadTasks() {
    this.setState({currentHref: location.href})

    var params = Params.parse()
    var query = Task.ransack(params.tasks_q).searchKey("tasks_q").page(params.tasks_page).pageKey("tasks_page")
    var result await = query.result()

    this.setState({
      query,
      result,
      tasks: result.models()
    })
  }

  render() {
    return (
      <div className="component-models-paginate">
        {this.state.tasks && this.content()}
      </div>
    )
  }

  content() {
    var { query, result, tasks } = this.state

    return (
      <div className="content-container">
        <table>
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
                <td>
                  {task.id()}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Paginate result={result} />
      </div>
    )
  }
}
