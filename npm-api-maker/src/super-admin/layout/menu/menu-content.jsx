import CanCan from "../../../can-can"
import {digg} from "diggerize"
import {memo, useMemo} from "react"
import MenuItem from "./menu-item"
import models from "../../models"
import Params from "../../../params"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import withCanCan from "@kaspernj/api-maker/src/with-can-can"

const abilities = []

for (const model of models) {
  abilities.push(
    [model, ["index"]]
  )
}

const ComponentsAdminLayoutMenuContent = ({active, canCan}) => {
  const sortedModels = useMemo(
    () => models.sort((a, b) => a.modelName().human({count: 2}).toLowerCase().localeCompare(b.modelName().human({count: 2}).toLowerCase())),
    []
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

ComponentsAdminLayoutMenuContent.propTypes = PropTypesExact({
  active: PropTypes.string,
  canCan: PropTypes.instanceOf(CanCan)
})

export default withCanCan(memo(ComponentsAdminLayoutMenuContent), abilities)
