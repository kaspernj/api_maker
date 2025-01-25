import React, {useMemo} from "react"
import BaseComponent from "../../../base-component"
import {digg} from "diggerize"
import memo from "set-state-compare/src/memo"
import MenuItem from "./menu-item"
import * as models from "models"
import Params from "../../../params"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component"
import useCanCan from "../../../use-can-can"
import useI18n from "i18n-on-steroids/src/use-i18n"

export default memo(shapeComponent(class ComponentsAdminLayoutMenuContent extends BaseComponent {
  static propTypes = PropTypesExact({
    active: PropTypes.string
  })

  render() {
    const {locale} = useI18n({namespace: "js.api_maker.super_admin.layout.menu.menu_content"})
    const {active} = this.p
    const canCan = useCanCan(() => models.map((modelClass) => [modelClass, ["index"]]))
    const sortedModels = useMemo(
      () => models.sort((a, b) => a.modelName().human({count: 2}).toLowerCase().localeCompare(b.modelName().human({count: 2}).toLowerCase())),
      [locale]
    )

    return (
      <>
        {sortedModels.map((model) => canCan?.can("index", model) &&
          <MenuItem
            active={active}
            icon="sitemap"
            identifier={digg(model.modelClassData(), "name")}
            label={model.modelName().human({count: 2})}
            key={model.modelClassData().name}
            to={Params.withParams({model: model.modelClassData().name})}
          />
        )}
      </>
    )
  }
}))
