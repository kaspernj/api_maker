import {CanCanLoader, Devise} from "@kaspernj/api-maker"

export default class RoutesCanCanLoader extends React.Component {
  state = {
    canCan: undefined
  }

  onResetAbilitiesClicked(e) {
    e.preventDefault()

    const {canCan} = this.state

    canCan.resetAbilities()
  }

  async onSignOutClicked(e) {
    e.preventDefault()

    await Devise.signOut()
  }

  render() {
    const {canCan} = this.state

    return (
      <Layout className="component-can-can-loader">
        <CanCanLoader abilities={[[Account, ["sum"]]]} component={this} />

        <button className="reset-abilities-button" onClick={(e) => this.onResetAbilitiesClicked(e)}>
          reset abilities
        </button>

        <button className="sign-out-button" onClick={(e) => this.onSignOutClicked(e)}>
          sign out
        </button>

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
      </Layout>
    )
  }
}
