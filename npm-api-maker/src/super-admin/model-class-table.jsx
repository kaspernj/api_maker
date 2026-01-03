/* eslint-disable sort-imports */
import BaseComponent from "../base-component"
import ConfigReader from "./config-reader"
import {digg} from "diggerize"
import hasEditConfig from "./has-edit-config.js"
import * as inflection from "inflection"
import memo from "set-state-compare/build/memo.js"
import Params from "../params.js"
import PropTypes from "prop-types"
import React, {useMemo} from "react"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import Table from "../table/table"
import useCurrentUser from "../use-current-user.js"

export default memo(shapeComponent(class ApiMakerSuperAdminModelClassTable extends BaseComponent {
  static propTypes = {
    modelClass: PropTypes.func.isRequired
  }

  render() {
    const {modelClass, ...restProps} = this.props
    const currentUser = useCurrentUser()
    const configReader = useMemo(() => ConfigReader.forModel(modelClass), [modelClass])
    const {columns, select} = useMemo(() => configReader.tableColumns(), [modelClass])
    const tableConfig = configReader.modelConfig?.table
    const tableProps = {}

    if (!columns) throw new Error("No columns given")

    if (tableConfig?.query) tableProps.collection = tableConfig.query

    return (
      <Table
        columns={columns}
        currentUser={currentUser}
        editModelPath={hasEditConfig(modelClass) ? this.tt.editModelPath : undefined}
        modelClass={modelClass}
        select={select}
        viewModelPath={this.tt.viewModelPath}
        workplace
        {...tableProps}
        {...restProps}
      />
    )
  }

  editModelPath = (args) => {
    const argName = inflection.camelize(digg(this.p.modelClass.modelClassData(), "name"), true)
    const model = digg(args, argName)

    return Params.withParams({
      model: this.p.modelClass.modelClassData().name,
      model_id: model.primaryKey(),
      mode: "edit"
    })
  }

  viewModelPath = (args) => {
    const argName = inflection.camelize(digg(this.p.modelClass.modelClassData(), "name"), true)
    const model = digg(args, argName)

    return Params.withParams({
      model: this.p.modelClass.modelClassData().name,
      model_id: model.primaryKey()
    })
  }
}))
