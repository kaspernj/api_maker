import React, {memo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import Devise from "@kaspernj/api-maker/build/devise.js"
import Services from "@kaspernj/api-maker/build/services.js"
import Layout from "components/layout"
import useEventEmitter from "ya-use-event-emitter"

export default memo(shapeComponent(class DeviseEvents extends ShapeComponent {
  setup() {
    this.useStates({
      signInCount: 0,
      signOutCount: 0
    })

    useEventEmitter(Devise.events(), "onDeviseSignIn", this.tt.onDeviseSignIn)
    useEventEmitter(Devise.events(), "onDeviseSignOut", this.tt.onDeviseSignOut)
  }

  render() {
    const {signInCount, signOutCount} = this.state

    return (
      <Layout className="routes-devise-events">
        <div data-testid="devise-sign-in-count">{signInCount}</div>
        <div data-testid="devise-sign-out-count">{signOutCount}</div>
        <button data-testid="devise-sign-in-button" onClick={this.tt.onSignInClicked}>
          Sign in
        </button>
        <button data-testid="devise-sign-out-button" onClick={this.tt.onSignOutClicked}>
          Sign out
        </button>
        <button data-testid="devise-sign-out-fail-button" onClick={this.tt.onSignOutFailClicked}>
          Sign out (fail)
        </button>
      </Layout>
    )
  }

  onDeviseSignIn = () => this.setState({signInCount: this.state.signInCount + 1})
  onDeviseSignOut = () => this.setState({signOutCount: this.state.signOutCount + 1})

  onSignInClicked = async (event) => {
    event.preventDefault()
    await Devise.signIn("admin@example.com", "password")
  }

  onSignOutClicked = async (event) => {
    event.preventDefault()
    await Devise.signOut()
  }

  onSignOutFailClicked = async (event) => {
    event.preventDefault()

    const services = Services.current()
    const originalSendRequest = services.sendRequest

    services.sendRequest = async (...args) => {
      if (args[0] === "Devise::SignOut") {
        throw new Error("Sign out failed")
      }

      return originalSendRequest.apply(services, args)
    }

    try {
      await Devise.signOut()
    } catch (error) {
      // Expected failure
    } finally {
      services.sendRequest = originalSendRequest
    }
  }
}))
