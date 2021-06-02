import {CanCan, Devise} from "@kaspernj/api-maker"
import LoaderWithShape from "components/can-can/loader-with-shape"
import LoaderWithState from "components/can-can/loader-with-state"

export default class RoutesCanCanLoader extends React.Component {
  state = {
    showAdditionalLoader: false
  }

  render() {
    const {showAdditionalLoader} = this.state

    return (
      <Layout className="routes-can-can-loader">
        <button className="reset-abilities-button" onClick={(e) => this.onResetAbilitiesClicked(e)}>
          reset abilities
        </button>
        <button className="sign-out-button" onClick={(e) => this.onSignOutClicked(e)}>
          sign out
        </button>
        <button className="load-reset-load-button" onClick={(e) => this.onLoadResetLoadClicked(e)}>
          load reset load
        </button>
        <LoaderWithShape />
        <LoaderWithState />
        {showAdditionalLoader &&
          <LoaderWithState className="additional-loader-with-state" />
        }
      </Layout>
    )
  }

  onSignOutClicked(e) {
    e.preventDefault()

    Devise.signOut()
  }

  onResetAbilitiesClicked(e) {
    e.preventDefault()

    CanCan.current().resetAbilities()
  }

  async onLoadResetLoadClicked(e) {
    e.preventDefault()

    this.setState({showAdditionalLoader: true})

    await Devise.signOut()
    await CanCan.current().resetAbilities()
  }
}
