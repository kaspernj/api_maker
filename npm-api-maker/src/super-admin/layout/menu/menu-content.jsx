import BaseComponent from "../../../base-component"
import {digg} from "diggerize"
import {memo, useMemo} from "react"
import MenuItem from "./menu-item"
import models from "../../models"
import Params from "../../../params"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import useCanCan from "../../../use-can-can"

export default memo(shapeComponent(class ComponentsAdminLayoutMenuContent extends BaseComponent {
  static propTypes = PropTypesExact({
    active: PropTypes.string
  })

  render() {
    const {active} = this.p
    const canCan = useCanCan(() => models.map((model) => [model, ["index"]]))
    const sortedModels = useMemo(
      () => models.sort((a, b) => a.modelName().human({count: 2}).toLowerCase().localeCompare(b.modelName().human({count: 2}).toLowerCase())),
      [I18n.locale]
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
