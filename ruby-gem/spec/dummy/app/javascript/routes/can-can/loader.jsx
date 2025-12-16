import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import CanCan from "@kaspernj/api-maker/dist/can-can"
import Devise from "@kaspernj/api-maker/dist/devise"
import React, {memo} from "react"
import Layout from "components/layout"
import LoaderThatSignsOutOnMount from "components/can-can/loader-that-signs-out-on-mount"
import LoaderWithState from "components/can-can/loader-with-state"

export default memo(shapeComponent(class RoutesCanCanLoader extends ShapeComponent {
  setup() {
    this.useStates({
      showLoaderThatSignsOutOnMount: false
    })
  }

  render() {
    const {showLoaderThatSignsOutOnMount} = this.s

    return (
      <Layout className="routes-can-can-loader">
        <button className="reset-abilities-button" onClick={this.tt.onResetAbilitiesClicked}>
          reset abilities
        </button>
        <button className="sign-out-button" onClick={this.tt.onSignOutClicked}>
          sign out
        </button>
        <button className="show-loader-that-signs-out-on-load-button" onClick={this.tt.onShowLoaderThatSignsOutOnMountClicked}>
          show loader that signs out on load
        </button>
        <LoaderWithState />
        {showLoaderThatSignsOutOnMount &&
          <LoaderThatSignsOutOnMount />
        }
      </Layout>
    )
  }

  onSignOutClicked = async (e) => {
    e.preventDefault()

    await Devise.signOut()
  }

  onResetAbilitiesClicked = (e) => {
    e.preventDefault()

    CanCan.current().resetAbilities()
  }

  onShowLoaderThatSignsOutOnMountClicked = (e) => {
    e.preventDefault()

    this.setState({showLoaderThatSignsOutOnMount: true})
  }
}))
