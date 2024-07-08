import BaseComponent from "../base-component"
import {digg} from "diggerize"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {memo} from "react"
import ModelClassTable from "./model-class-table"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import ShowNav from "./show-nav"
import useQueryParams from "on-location-changed/src/use-query-params"

export default memo(shapeComponent(class ApiMakerSuperAdminShowReflectionPage extends BaseComponent {
  static propTypes = propTypesExact({
    modelClass: PropTypes.func.isRequired
  })

  render() {
    const {modelClass} = this.p
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
}))
