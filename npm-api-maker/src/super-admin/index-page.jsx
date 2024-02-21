import ModelClassTable from "./model-class-table"
import PropTypes from "prop-types"
import {memo} from "react"

const ApiMakerSuperAdminIndexPage = ({modelClass}) => {
  return (
    <div className="super-admin--index-page">
      <ModelClassTable
        modelClass={modelClass}
      />
    </div>
  )
}

ApiMakerSuperAdminIndexPage.propTypes = {
  modelClass: PropTypes.func.isRequired
}

export default memo(ApiMakerSuperAdminIndexPage)
