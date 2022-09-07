import {digg, digs} from "diggerize"
import modelLoadWrapper from "../model-load-wrapper"
import PropTypes from "prop-types"
import React from "react"
import ModelClassTable from "./model-class-table"
import ShowNav from "./show-nav"

class ApiMakerSuperAdminShowReflectionPage extends React.PureComponent {
  static propTypes = {
    currentUser: PropTypes.object,
    modelClass: PropTypes.func.isRequired,
    queryParams: PropTypes.object.isRequired
  }

  render() {
    const {currentUser, modelClass, queryParams} = digs(this.props, "currentUser", "modelClass", "queryParams")
    const model = this.model()
    const reflections = modelClass.reflections()
    const reflection = reflections.find((reflectionI) => reflectionI.name() == queryParams.model_reflection)
    const reflectionModelClass = reflection.modelClass()
    let collection

    if (model) collection = model[reflection.name()]()

    return (
      <div className="super-admin--show-page">
        {model &&
          <ShowNav model={model} modelClass={modelClass} queryParams={queryParams} />
        }
        {collection &&
          <ModelClassTable
            collection={collection}
            currentUser={currentUser}
            key={reflectionModelClass.modelName().human()}
            modelClass={reflectionModelClass}
            queryParams={queryParams}
          />
        }
      </div>
    )
  }

  model() {
    const {modelClass} = digs(this.props, "modelClass")
    const camelizedLower = digg(modelClass.modelClassData(), "camelizedLower")

    return digg(this, "props", camelizedLower)
  }
}

const modelClassResolver = {callback: ({queryParams}) => {
  const modelClassName = digg(queryParams, "model")
  const modelClass = digg(require("../models.mjs.erb"), modelClassName)

  return modelClass
}}

export default modelLoadWrapper(
  ApiMakerSuperAdminShowReflectionPage,
  modelClassResolver,
  {
    loadByQueryParam: ({props}) => props.queryParams.model_id
  }
)
