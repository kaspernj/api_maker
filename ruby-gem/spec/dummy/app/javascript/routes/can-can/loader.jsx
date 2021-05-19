import {CanCan, Devise} from "@kaspernj/api-maker"
import LoaderWithShape from "components/can-can/loader-with-shape"
import LoaderWithState from "components/can-can/loader-with-state"

export default class RoutesCanCanLoader extends React.Component {
  onSignOutClicked(e) {
    e.preventDefault()

    Devise.signOut()
  }

  onResetAbilitiesClicked(e) {
    e.preventDefault()

    CanCan.current().resetAbilities()
  }

  render() {
    return (
      <Layout className="routes-can-can-loader">
        <button className="reset-abilities-button" onClick={(e) => this.onResetAbilitiesClicked(e)}>
          reset abilities
        </button>
        <button className="sign-out-button" onClick={(e) => this.onSignOutClicked(e)}>
          sign out
        </button>
        <LoaderWithShape />
        <LoaderWithState />
      </Layout>
    )
  }
}
