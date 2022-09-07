import {digs} from "diggerize"
import ModelClassTable from "./model-class-table"
import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerSuperAdminIndexPage extends React.PureComponent {
  static propTypes = {
    currentUser: PropTypes.object,
    modelClass: PropTypes.func.isRequired,
    queryParams: PropTypes.object.isRequired
  }

  render() {
    const {currentUser, modelClass, queryParams} = digs(this.props, "currentUser", "modelClass", "queryParams")

    return (
      <ModelClassTable
        currentUser={currentUser}
        modelClass={modelClass}
        queryParams={queryParams}
      />
    )
  }
}
