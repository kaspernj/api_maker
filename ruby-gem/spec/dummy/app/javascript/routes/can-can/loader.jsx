import {CanCan, Devise} from "@kaspernj/api-maker"
import {digs} from "@kaspernj/object-digger"
import LoaderWithShape from "components/can-can/loader-with-shape"
import LoaderWithState from "components/can-can/loader-with-state"

export default class RoutesCanCanLoader extends React.Component {
  state = {
    showAdditionalLoader: false
  }

  render() {
    const {showAdditionalLoader} = digs(this.state, "showAdditionalLoader")

    return (
      <Layout className="routes-can-can-loader">
        <button className="reset-abilities-button" onClick={(e) => this.onResetAbilitiesClicked(e)}>
          reset abilities
        </button>
        <button className="sign-out-button" onClick={(e) => this.onSignOutClicked(e)}>
          sign out
        </button>
        <button className="load-reset-load-button" onClick={(e) => this.onShowAdditionalLoaderClicked(e)}>
          show additional loader
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

  async onShowAdditionalLoaderClicked(e) {
    e.preventDefault()

    this.setState({showAdditionalLoader: true})

    Devise.signOut()
  }
}
