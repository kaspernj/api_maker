import models from "@kaspernj/api-maker/build/models"
import Paginate from "@kaspernj/api-maker/build/bootstrap/paginate"
import PropTypes from "prop-types"
import PureComponent from "set-state-compare/src/pure-component"
import React from "react"
import SortLink from "@kaspernj/api-maker/build/bootstrap/sort-link"
import withQueryParams from "on-location-changed/src/with-query-params"

const {Task} = models

class ModelsPaginate extends PureComponent {
  static propTypes = {
    queryParams: PropTypes.object.isRequired
  }

  state = {
    queryParamsString: JSON.stringify(this.props.queryParams)
  }

  componentDidMount() {
    this.loadTasks()
  }

  componentDidUpdate() {
    const queryParamsString = JSON.stringify(this.props.queryParams)

    if (this.state.queryParamsString != queryParamsString) {
      this.setState({queryParamsString}, this.loadTasks)
    }
  }

  loadTasks = async () => {
    const {queryParams} = this.props
    const query = Task.ransack(queryParams.tasks_q).searchKey("tasks_q").page(queryParams.tasks_page).pageKey("tasks_page")
    const result = await query.result()

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
    const { query, result, tasks } = this.state

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

export default withQueryParams(ModelsPaginate)
