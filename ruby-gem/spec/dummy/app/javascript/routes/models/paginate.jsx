import BaseComponent from "@kaspernj/api-maker/build/base-component"
import memo from "set-state-compare/src/memo"
import models from "@kaspernj/api-maker/build/models"
import Paginate from "@kaspernj/api-maker/build/bootstrap/paginate"
import React from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import SortLink from "@kaspernj/api-maker/build/bootstrap/sort-link"
import useQueryParams from "on-location-changed/build/use-query-params"

const {Task} = models

export default memo(shapeComponent(class ModelsPaginate extends BaseComponent {
  setup() {
    this.queryParams = useQueryParams()

    this.useStates({
      query: null,
      queryParamsString: () => JSON.stringify(this.tt.queryParams),
      result: null,
      tasks: null
    })
  }

  componentDidMount() {
    this.loadTasks()
  }

  componentDidUpdate() {
    const queryParamsString = JSON.stringify(this.tt.queryParams)

    if (this.s.queryParamsString != queryParamsString) {
      this.setState({queryParamsString}, this.loadTasks)
    }
  }

  loadTasks = async () => {
    const {queryParams} = this.tt
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
    const {query, result, tasks} = this.s

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
}))
