import BaseComponent from "../base-component"
import Link from "../link"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {memo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import ShowReflectionLink from "./show-reflection-link"
import useQueryParams from "on-location-changed/src/use-query-params"

export default memo(shapeComponent(class ApiMakerSuperAdminShowNav extends BaseComponent {
  static propTypes = PropTypesExact({
    model: PropTypes.object.isRequired,
    modelClass: PropTypes.func.isRequired
  })

  render() {
    const {model, modelClass} = this.props
    const queryParams = useQueryParams()
    const reflections = modelClass.reflections()

    return (
      <div>
        <div>
          <Link to={Params.withParams({model: modelClass.modelClassData().name, model_id: queryParams.model_id})}>
            {I18n.t("js.api_maker.suprt_admin.show_reflection_page.general", {defaultValue: "General"})}
          </Link>
        </div>
        {model && reflections.filter((reflection) => reflection.macro() == "has_many").map((reflection) =>
          <div key={reflection.name()}>
            <ShowReflectionLink model={model} modelClass={modelClass} reflection={reflection} />
          </div>
        )}
      </div>
    )
  }
}))
