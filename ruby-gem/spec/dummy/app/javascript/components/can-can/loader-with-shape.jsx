import {CanCanLoader} from "@kaspernj/api-maker";
import {digs} from "@kaspernj/object-digger"
import {Shape} from "set-state-compare"

export default class CanCanWithShape extends React.Component {
  shape = new Shape(this, {
    canCan: undefined
  })

  render() {
    const {canCan} = digs(this.shape, "canCan")

    return (
      <div className="components-can-can-loader-with-shape">
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
