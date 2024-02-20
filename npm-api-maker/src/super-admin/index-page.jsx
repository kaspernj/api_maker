import ModelClassTable from "./model-class-table"
import PropTypes from "prop-types"
import {memo} from "react"

const ApiMakerSuperAdminIndexPage = ({modelClass}) => {
  return (
    <ModelClassTable
      modelClass={modelClass}
    />
  )
}

ApiMakerSuperAdminIndexPage.propTypes = {
  modelClass: PropTypes.func.isRequired
}

export default memo(ApiMakerSuperAdminIndexPage)
