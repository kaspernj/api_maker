import memo from "set-state-compare/build/memo.js"
import Paginate from "@kaspernj/api-maker/build/bootstrap/paginate"
import React from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import SortLink from "@kaspernj/api-maker/build/bootstrap/sort-link"
import {Task} from "models.js"
import useQueryParams from "on-location-changed/build/use-query-params.js"

/** @typedef {object} ModelsPaginateProps */

/**
 * @typedef {object} ModelsPaginateState
 * @property {import("@kaspernj/api-maker/build/collection.js").default | null} query
 * @property {string | undefined} queryParamsString
 * @property {import("@kaspernj/api-maker/build/result.js").default | null} result
 * @property {Task[] | null} tasks
 */

/** @augments {ShapeComponent<ModelsPaginateProps, ModelsPaginateState>} */
class ModelsPaginate extends ShapeComponent {
  state = /** @type {ModelsPaginateState} */ ({
    query: null,
    queryParamsString: undefined,
    result: null,
    tasks: null
  })

  setup() {
    this.queryParams = useQueryParams()
  }

  componentDidMount() {
    this.loadTasks()
  }

  syncQueryParams = () => {
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
    this.syncQueryParams()

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
}

export default memo(shapeComponent(ModelsPaginate))
