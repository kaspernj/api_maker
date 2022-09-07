import ConfigReader from "./config-reader"
import {digg, digs} from "diggerize"
import Params from "../params"
import PropTypes from "prop-types"
import React from "react"
import Table from "../table/table"

export default class ApiMakerSuperAdminModelClassTable extends React.PureComponent {
  static propTypes = {
    currentUser: PropTypes.object,
    modelClass: PropTypes.func.isRequired,
    queryParams: PropTypes.object.isRequired
  }

  render() {
    const {currentUser, modelClass, queryParams, ...restProps} = this.props

    return (
      <Table
        columns={digg(this, "columns")}
        currentUser={currentUser}
        modelClass={modelClass}
        viewModelPath={digg(this, "viewModelPath")}
        {...restProps}
      />
    )
  }

  columns = () => {
    const {modelClass} = digs(this.props, "modelClass")
    const configReader = ConfigReader.forModel(modelClass)

    return configReader.tableColumns()
  }

  viewModelPath = (args) => {
    const argName = digg(this.props.modelClass.modelClassData(), "camelizedLower")
    const model = digg(args, argName)

    return Params.withParams({
      model: this.props.modelClass.modelClassData().name,
      model_id: model.primaryKey()
    })
  }
}
