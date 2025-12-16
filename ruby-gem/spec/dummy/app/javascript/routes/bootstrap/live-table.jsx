import ApiMakerTable from "@kaspernj/api-maker/dist/table/table"
import ApplicationHistory from "shared/application-history"
import Devise from "@kaspernj/api-maker/dist/devise"
import {digg, digs} from "diggerize"
import Input from "@kaspernj/api-maker/dist/bootstrap/input"
import Layout from "components/layout"
import modelClassRequire from "@kaspernj/api-maker/dist/model-class-require"
import Params from "@kaspernj/api-maker/dist/params"
import React from "react"

const Task = modelClassRequire("Task")

export default class BootstrapLiveTable extends React.PureComponent {
  render() {
    const params = Params.parse()

    let liveTableProps

    if (params.live_table_props) {
      liveTableProps = JSON.parse(params.live_table_props)
    } else {
      liveTableProps = {}
    }

    if (params.no_records_available_content) {
      liveTableProps.noRecordsAvailableContent = () =>
        <div className="no-tasks-available-content">
          No tasks were available!
        </div>
    }

    if (params.no_records_found_content) {
      liveTableProps.noRecordsFoundContent = () =>
        <div className="no-tasks-found-content">
          No tasks were found!
        </div>
    }

    return (
      <Layout>
        <ApiMakerTable
          appHistory={ApplicationHistory}
          columns={digg(this, "columns")}
          currentUser={Devise.currentUser()}
          defaultDateFormatName="date.formats.short"
          defaultDateTimeFormatName="time.formats.short"
          defaultParams={{s: "name asc"}}
          filterContent={this.filterContent}
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

  columns = () => [
    {
      attribute: "id",
      sortKey: "id"
    },
    {
      attribute: "name",
      sortKey: "name"
    },
    {
      attribute: "name",
      path: ["project"],
      sortKey: "projectName"
    },
    {
      attribute: "createdAt",
      sortKey: "createdAt"
    },
    {
      attribute: "finished",
      defaultVisible: false,
      sortKey: "finished"
    }
  ]
}
