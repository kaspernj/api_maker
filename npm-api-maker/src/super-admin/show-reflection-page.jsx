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
  const model = digg(restProps, camelizedLower)
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

const modelClassResolver = {callback: ({queryParams}) => {
  const modelClassName = digg(queryParams, "model")
  const modelClass = digg(require("../models.mjs.erb"), modelClassName)

  return modelClass
}}

export default withModel(
  memo(ApiMakerSuperAdminShowReflectionPage),
  modelClassResolver,
  {
    loadByQueryParam: ({props}) => props.queryParams.model_id
  }
)
