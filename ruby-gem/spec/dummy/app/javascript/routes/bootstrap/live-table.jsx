import { SortLink, LiveTable } from "@kaspernj/api-maker-bootstrap"

export default class BootstrapLiveTable extends React.Component {
  render() {
    return (
      <Layout>
        <LiveTable
          columnsContent={(args) => this.columnsContent(args)}
          headersContent={(args) => this.headersContent(args)}
          modelClass={Task}
        />
      </Layout>
    )
  }

  headersContent({query}) {
    return (
      <>
        <th>
          <SortLink attribute="id" query={query} title="ID" />
        </th>
        <th>
          <SortLink attribute="name" query={query} title="Name" />
        </th>
      </>
    )
  }

  columnsContent({model: task}) {
    return (
      <>
        <td>
          {task.id()}
        </td>
        <td>
          {task.name()}
        </td>
      </>
    )
  }
}
