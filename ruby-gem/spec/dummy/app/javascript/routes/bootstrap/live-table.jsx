import ApplicationHistory from "shared/application-history"
import { digs } from "@kaspernj/object-digger"
import { Input, SortLink, LiveTable } from "@kaspernj/api-maker-bootstrap"

export default class BootstrapLiveTable extends React.Component {
  render() {
    return (
      <Layout>
        <LiveTable
          appHistory={ApplicationHistory}
          columnsContent={(args) => this.columnsContent(args)}
          filterContent={(args) => this.filterContent(args)}
          headersContent={(args) => this.headersContent(args)}
          modelClass={Task}
        />
      </Layout>
    )
  }

  filterContent(args) {
    const {onFilterChangedWithDelay, qParams} = digs(args, "onFilterChangedWithDelay", "qParams")

    return (
      <Input
        defaultValue={qParams.name_cont}
        label={Task.humanAttributeName("name")}
        name="name_cont"
        onChange={onFilterChangedWithDelay}
      />
    )
  }

  headersContent({query}) {
    return (
      <>
        <th>
          <SortLink attribute="id" query={query} />
        </th>
        <th>
          <SortLink attribute="name" query={query} />
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
