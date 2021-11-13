import ApplicationHistory from "shared/application-history"
import { digs } from "diggerize"
import { Input, SortLink, LiveTable } from "@kaspernj/api-maker-bootstrap"

export default class BootstrapLiveTable extends React.PureComponent {
  render() {
    const params = Params.parse()

    let liveTableProps

    if (params.live_table_props) {
      liveTableProps = JSON.parse(params.live_table_props)
    } else {
      liveTableProps = {}
    }

    if (params.no_records_found_content) {
      liveTableProps.noRecordsFoundContent = () =>
        <div className="no-tasks-found-content">
          No tasks were found!
        </div>
    }

    return (
      <Layout>
        <LiveTable
          appHistory={ApplicationHistory}
          columnsContent={this.columnsContent}
          defaultParams={{s: "name asc"}}
          filterContent={this.filterContent}
          headersContent={this.headersContent}
          modelClass={Task}
          {...liveTableProps}
        />
      </Layout>
    )
  }

  filterContent = (args) => {
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

  headersContent = ({query}) => {
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

  columnsContent = ({task}) => {
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
