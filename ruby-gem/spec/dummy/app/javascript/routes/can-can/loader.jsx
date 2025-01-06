import CanCan from "@kaspernj/api-maker/build/can-can"
import Devise from "@kaspernj/api-maker/build/devise"
import {digs} from "diggerize"
import LoaderWithShape from "components/can-can/loader-with-shape"
import LoaderThatSignsOutOnMount from "components/can-can/loader-that-signs-out-on-mount"
import LoaderWithState from "components/can-can/loader-with-state"

export default class RoutesCanCanLoader extends React.PureComponent {
  state = {
    showLoaderThatSignsOutOnMount: false
  }

  render() {
    const {showLoaderThatSignsOutOnMount} = digs(this.state, "showLoaderThatSignsOutOnMount")

    return (
      <Layout className="routes-can-can-loader">
        <button className="reset-abilities-button" onClick={this.onResetAbilitiesClicked}>
          reset abilities
        </button>
        <button className="sign-out-button" onClick={this.onSignOutClicked}>
          sign out
        </button>
        <button className="show-loader-that-signs-out-on-load-button" onClick={this.onShowLoaderThatSignsOutOnMountClicked}>
          show loader that signs out on load
        </button>
        <LoaderWithShape />
        <LoaderWithState />
        {showLoaderThatSignsOutOnMount &&
          <LoaderThatSignsOutOnMount />
        }
      </Layout>
    )
  }

  onSignOutClicked = (e) => {
    e.preventDefault()

    Devise.signOut()
  }

  onResetAbilitiesClicked = (e) => {
    e.preventDefault()

    CanCan.current().resetAbilities()
  }

  onShowLoaderThatSignsOutOnMountClicked = (e) => {
    e.preventDefault()

    this.setState({showLoaderThatSignsOutOnMount: true})
  }
}
