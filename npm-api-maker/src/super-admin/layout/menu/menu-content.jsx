import CanCanLoader from "@kaspernj/api-maker/src/can-can-loader"
import {digg, digs} from "diggerize"
import MenuItem from "./menu-item"
import Params from "../../../params"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import * as modelsModule from "@kaspernj/api-maker/src/models.mjs.erb"

const models = []

for (const modelKey of Object.keys(modelsModule)) {
  const model = modelsModule[modelKey]

  models.push(model)
}

const abilities = []

for (const model of models) {
  abilities.push(
    [model, ["index"]]
  )
}

export default class ComponentsAdminLayoutMenuContent extends React.PureComponent {
  static propTypes = PropTypesExact({
    active: PropTypes.string
  })

  state = {
    canCan: undefined
  }

  render() {
    const {active} = digs(this.props, "active")
    const {canCan} = digs(this.state, "canCan")

    return (
      <>
        <CanCanLoader abilities={abilities} component={this} />
        {this.sortedModels().map((model) => canCan?.can("index", model) &&
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

  sortedModels() {
    return models.sort((a, b) => a.modelName().human({count: 2}).toLowerCase().localeCompare(b.modelName().human({count: 2}).toLowerCase()))
  }
}
