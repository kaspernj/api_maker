import {CanCanLoader} from "@kaspernj/api-maker";
import {digs} from "@kaspernj/object-digger"

export default class CanCanWithState extends React.Component {
  state = {
    canCan: undefined
  }

  render() {
    const {canCan} = digs(this.state, "canCan")

    return (
      <div className="components-can-can-loader-with-state">
        <CanCanLoader abilities={[[Account, ["sum"]]]} component={this} />

        {canCan && canCan.can("sum", Account) &&
          <div className="can-access-admin">
            can access admin
          </div>
        }
        {canCan && !canCan.can("sum", Account) &&
          <div className="cannot-access-admin">
            can not access admin
          </div>
        }
      </div>
    )
  }
}
