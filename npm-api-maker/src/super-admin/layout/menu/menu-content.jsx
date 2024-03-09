import {digg} from "diggerize"
import {memo, useMemo} from "react"
import MenuItem from "./menu-item"
import models from "../../models"
import Params from "../../../params"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import useCanCan from "../../../use-can-can"

const ComponentsAdminLayoutMenuContent = ({active}) => {
  const {canCan} = useCanCan(() => models.map((model) => [model, ["index"]]))
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

ComponentsAdminLayoutMenuContent.propTypes = PropTypesExact({
  active: PropTypes.string
})

export default memo(ComponentsAdminLayoutMenuContent)
