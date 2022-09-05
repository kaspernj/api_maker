import {digg, digs} from "diggerize"
import inflection from "inflection"
import Params from "../../params"
import PropTypes from "prop-types"
import React from "react"
import Table from "../../table/table"

export default class ApiMakerSuperAdminIndexPage extends React.PureComponent {
  static propTypes = {
    currentUser: PropTypes.object,
    modelClass: PropTypes.func.isRequired,
    queryParams: PropTypes.object.isRequired
  }

  render() {
    const {currentUser, modelClass} = digs(this.props, "currentUser", "modelClass")

    return (
      <Table
        columns={digg(this, "columns")}
        currentUser={currentUser}
        modelClass={modelClass}
        viewModelPath={digg(this, "viewModelPath")}
      />
    )
  }

  columns = () => {
    const {modelClass} = digs(this.props, "modelClass")
    const attributes = modelClass.attributes()
    const columns = []

    for (const attribute of attributes) {
      if (!attribute.isSelectedByDefault()) continue

      const camelizedName = inflection.camelize(attribute.name(), true)
      const column = {
        attribute: camelizedName
      }

      if (attribute.isColumn()) column.sortKey = camelizedName

      columns.push(column)
    }

    return columns
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
