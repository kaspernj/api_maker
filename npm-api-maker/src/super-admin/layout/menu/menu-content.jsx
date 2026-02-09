/* eslint-disable new-cap, newline-per-chained-call, sort-imports */
import React, {useMemo} from "react"
import BaseComponent from "../../../base-component"
import {digg} from "diggerize"
import memo from "set-state-compare/build/memo.js"
import MenuItem from "./menu-item"
import models from "../../models.js"
import Params from "../../../params.js"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import useCanCan from "../../../use-can-can.js"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"

export default memo(shapeComponent(class ComponentsAdminLayoutMenuContent extends BaseComponent {
  static propTypes = PropTypesExact({
    active: PropTypes.string
  })

  render() {
    const {locale} = useI18n({namespace: "js.api_maker.super_admin.layout.menu.menu_content"})
    const {active} = this.p
    const abilitiesToLoad = useMemo(() => models.map((modelClass) => [modelClass, ["index"]]), [])
    const canCan = useCanCan(() => abilitiesToLoad)
    const sortedModels = useMemo(
      () => models.sort((a, b) => a.modelName().human({count: 2}).toLowerCase().localeCompare(b.modelName().human({count: 2}).toLowerCase())),
      [locale]
    )
    const abilityStates = sortedModels.map((modelClass) => {
      const modelName = digg(modelClass.modelClassData(), "name")
      const canIndex = canCan?.can("index", modelClass)

      return {canIndex, modelClass, modelName}
    })

    return (
      <>
        {abilityStates.map((abilityState) => abilityState.canIndex === true &&
          <MenuItem
            active={active}
            icon="sitemap"
            identifier={abilityState.modelName}
            key={abilityState.modelClass.modelClassData().name}
            label={abilityState.modelClass.modelName().human({count: 2})}
            to={Params.withParams({model: abilityState.modelClass.modelClassData().name})}
          />
        )}
      </>
    )
  }
}))
