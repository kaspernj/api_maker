import React, {memo} from "react"
import {Pressable, Text, View} from "react-native"
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
        <View testID="devise-sign-in-count">
          <Text>{signInCount}</Text>
        </View>
        <View testID="devise-sign-out-count">
          <Text>{signOutCount}</Text>
        </View>
        <Pressable testID="devise-sign-in-button" onPress={this.tt.onSignInClicked}>
          <Text>Sign in</Text>
        </Pressable>
        <Pressable testID="devise-sign-out-button" onPress={this.tt.onSignOutClicked}>
          <Text>Sign out</Text>
        </Pressable>
        <Pressable testID="devise-sign-out-fail-button" onPress={this.tt.onSignOutFailClicked}>
          <Text>Sign out (fail)</Text>
        </Pressable>
      </Layout>
    )
  }

  onDeviseSignIn = () => this.setState({signInCount: this.state.signInCount + 1})
  onDeviseSignOut = () => this.setState({signOutCount: this.state.signOutCount + 1})

  onSignInClicked = async () => {
    await Devise.signIn("admin@example.com", "password")
  }

  onSignOutClicked = async () => {
    await Devise.signOut()
  }

  onSignOutFailClicked = async () => {
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
