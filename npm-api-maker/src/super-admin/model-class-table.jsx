import ConfigReader from "./config-reader"
import {digg} from "diggerize"
import * as inflection from "inflection"
import Params from "../params"
import PropTypes from "prop-types"
import {memo, useCallback} from "react"
import Table from "../table/table"
import useCurrentUser from "../use-current-user"
import useShape from "set-state-compare/src/use-shape.js"

const ApiMakerSuperAdminModelClassTable = (props) => {
  const s = useShape(props)
  const {modelClass, ...restProps} = props
  const currentUser = useCurrentUser()
  const configReader = useMemo(() => ConfigReader.forModel(modelClass), [modelClass])
  const columns = useMemo(() => configReader.tableColumns(), [modelClass])
  const tableConfig = configReader.modelConfig.table

  const editModelPath = useCallback((args) => {
    const argName = inflection.camelize(digg(s.p.modelClass.modelClassData(), "name"), true)
    const model = digg(args, argName)

    return Params.withParams({
      model: s.p.modelClass.modelClassData().name,
      model_id: model.primaryKey(),
      mode: "edit"
    })
  }, [])

  const viewModelPath = useCallback((args) => {
    const argName = inflection.camelize(digg(s.p.modelClass.modelClassData(), "name"), true)
    const model = digg(args, argName)

    return Params.withParams({
      model: s.p.modelClass.modelClassData().name,
      model_id: model.primaryKey()
    })
  }, [])

  const tableProps = {}

  if (tableConfig.query) tableProps.collection = tableConfig.query

  return (
    <Table
      columns={columns}
      currentUser={currentUser}
      editModelPath={editModelPath}
      modelClass={modelClass}
      viewModelPath={viewModelPath}
      {...tableProps}
      {...restProps}
    />
  )
}

ApiMakerSuperAdminModelClassTable.propTypes = {
  modelClass: PropTypes.func.isRequired
}

export default memo(ApiMakerSuperAdminModelClassTable)
