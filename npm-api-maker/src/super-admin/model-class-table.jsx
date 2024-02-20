import ConfigReader from "./config-reader"
import {digg} from "diggerize"
import * as inflection from "inflection"
import Params from "../params"
import PropTypes from "prop-types"
import {memo, useCallback} from "react"
import Table from "../table/table"
import useCurrentUser from "../use-current-user"

const ApiMakerSuperAdminModelClassTable = ({modelClass, ...restProps}) => {
  const currentUser = useCurrentUser()

  const columns = useCallback(() => {
    const configReader = ConfigReader.forModel(modelClass)

    return configReader.tableColumns()
  }, [modelClass])

  const viewModelPath = useCallback((args) => {
    const argName = inflection.camelize(digg(modelClass.modelClassData(), "name"), true)
    const model = digg(args, argName)

    return Params.withParams({
      model: modelClass.modelClassData().name,
      model_id: model.primaryKey()
    })
  }, [modelClass])

  return (
    <Table
      columns={columns}
      currentUser={currentUser}
      modelClass={modelClass}
      viewModelPath={viewModelPath}
      {...restProps}
    />
  )
}

ApiMakerSuperAdminModelClassTable.propTypes = {
  modelClass: PropTypes.func.isRequired
}

export default memo(ApiMakerSuperAdminModelClassTable)
