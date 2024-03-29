import {digg} from "diggerize"
import PropTypes from "prop-types"
import React, {memo} from "react"
import ModelClassTable from "./model-class-table"
import ShowNav from "./show-nav"
import useQueryParams from "on-location-changed/src/use-query-params"
import withModel from "../with-model"

const ApiMakerSuperAdminShowReflectionPage = ({modelClass, restProps}) => {
  const queryParams = useQueryParams()
  const camelizedLower = digg(modelClass.modelClassData(), "camelizedLower")
  const useModelResult = useModel(modelClass, {loadByQueryParam: ({queryParams}) => digg(queryParams, "model_id")})
  const model = digg(useModelResult, camelizedLower)
  const reflections = modelClass.reflections()
  const reflection = reflections.find((reflectionI) => reflectionI.name() == queryParams.model_reflection)
  const reflectionModelClass = reflection.modelClass()
  let collection

  if (model) collection = model[reflection.name()]()

  return (
    <div className="super-admin--show-page">
      {model &&
        <ShowNav model={model} modelClass={modelClass} />
      }
      {collection &&
        <ModelClassTable
          collection={collection}
          key={reflectionModelClass.modelName().human()}
          modelClass={reflectionModelClass}
        />
      }
    </div>
  )
}

ApiMakerSuperAdminShowReflectionPage.propTypes = {
  modelClass: PropTypes.func.isRequired
}

export default memo(ApiMakerSuperAdminShowReflectionPage)
