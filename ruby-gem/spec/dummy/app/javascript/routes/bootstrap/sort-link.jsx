import Card from "@kaspernj/api-maker/build/bootstrap/card"
import Layout from "components/layout"
import memo from "set-state-compare/build/memo.js"
import React from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import SortLink from "@kaspernj/api-maker/build/bootstrap/sort-link"
import {Task} from "models.js"
import useQueryParams from "on-location-changed/build/use-query-params.js"

/** @typedef {Record<string, never>} BootstrapSortLinkProps */

/**
 * @typedef {object} BootstrapSortLinkState
 * @property {import("@kaspernj/api-maker/build/collection.js").default | null} query
 * @property {string | undefined} queryParamsString
 * @property {Task[] | null} tasks
 */

/** @augments {ShapeComponent<BootstrapSortLinkProps, BootstrapSortLinkState>} */
class BootstrapSortLink extends ShapeComponent {
  state = /** @type {BootstrapSortLinkState} */ ({
    query: null,
    queryParamsString: undefined,
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

    if (this.s.queryParamsString != queryParamsString)
      this.setState({queryParamsString}, this.tt.loadTasks)
  }

  loadTasks = async () => {
    const qParams = this.tt.queryParams.q ? JSON.parse(this.tt.queryParams.q) : {}
    const query = Task.ransack(qParams)
    const result = await query.result()

    this.setState({
      tasks: result.models(),
      query
    })
  }

  render() {
    this.syncQueryParams()
    const {tasks} = this.s

    return (
      <Layout className="component-bootstrap-sort-link">
        {tasks && this.content()}
      </Layout>
    )
  }

  content() {
    const {query, tasks} = this.s

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

export default memo(shapeComponent(BootstrapSortLink))
