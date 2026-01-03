/* eslint-disable implicit-arrow-linebreak, new-cap, react/jsx-max-depth, sort-imports */
import BaseComponent from "../base-component"
import Link from "../link"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import memo from "set-state-compare/build/memo.js"
import Params from "../params.js"
import React, {useMemo} from "react"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import ShowReflectionLink from "./show-reflection-link"
import Text from "../utils/text"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"
import useQueryParams from "on-location-changed/build/use-query-params.js"
import {View} from "react-native"

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
    const dataSet = useMemo(() => ({component: "super-admin--show-nav"}), [])

    return (
      <View dataSet={dataSet}>
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
