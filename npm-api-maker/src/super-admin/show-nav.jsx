import BaseComponent from "../base-component"
import Link from "../link"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {memo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import ShowReflectionLink from "./show-reflection-link"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"
import useQueryParams from "on-location-changed/src/use-query-params"
import {Text, View} from "react-native"

export default memo(shapeComponent(class ApiMakerSuperAdminShowNav extends BaseComponent {
  static propTypes = PropTypesExact({
    model: PropTypes.object.isRequired,
    modelClass: PropTypes.func.isRequired
  })

  render() {
    const {t} = useI18n({namespace: "js.api_maker.suprt_admin.show_reflection_page"})
    const {model, modelClass} = this.props
    const queryParams = useQueryParams()
    const reflections = modelClass.reflections()

    return (
      <View dataSet={{component: "super-admin--show-nav"}}>
        <View>
          <Link to={Params.withParams({model: modelClass.modelClassData().name, model_id: queryParams.model_id})}>
            <Text>
              {t(".general", {defaultValue: "General"})}
            </Text>
          </Link>
        </View>
        {model && reflections.filter((reflection) => reflection.macro() == "has_many").map((reflection) =>
          <View key={reflection.name()}>
            <ShowReflectionLink model={model} modelClass={modelClass} reflection={reflection} />
          </View>
        )}
      </View>
    )
  }
}))
