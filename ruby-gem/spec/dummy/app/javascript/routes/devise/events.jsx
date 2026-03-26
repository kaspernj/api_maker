import React, {memo} from "react"
import {Pressable, Text, View} from "react-native"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import {useEffect} from "react"
import CableConnectionPool from "@kaspernj/api-maker/build/cable-connection-pool.js"
import CableSubscriptionPool from "@kaspernj/api-maker/build/cable-subscription-pool.js"
import Devise from "@kaspernj/api-maker/build/devise.js"
import Services from "@kaspernj/api-maker/build/services.js"
import useUpdatedEvent from "@kaspernj/api-maker/build/use-updated-event.js"
import Layout from "components/layout"
import {Task, User} from "models.js"
import useEventEmitter from "ya-use-event-emitter"

export default memo(shapeComponent(class DeviseEvents extends ShapeComponent {
  setup() {
    this.useStates({
      subscribedTask: null,
      subscribedTaskName: "",
      subscribedUser: null,
      subscriptionConnected: "false",
      subscriptionUpdateCount: 0,
      taskUpdateCount: 0,
      signInCount: 0,
      signOutCount: 0
    })

    useEventEmitter(Devise.events(), "onDeviseSignIn", this.tt.onDeviseSignIn)
    useEventEmitter(Devise.events(), "onDeviseSignOut", this.tt.onDeviseSignOut)
    useEffect(() => {
      void this.loadSubscribedUser()
    }, [])
    useUpdatedEvent(this.s.subscribedUser, this.tt.onSubscribedUserUpdated, {onConnected: this.tt.onSubscriptionConnected})
    useUpdatedEvent(this.s.subscribedTask, this.tt.onSubscribedTaskUpdated)
  }

  render() {
    const {signInCount, signOutCount, subscribedTaskName, subscriptionConnected, subscriptionUpdateCount, taskUpdateCount} = this.state

    return (
      <Layout className="routes-devise-events">
        <View testID="devise-subscription-connected">
          <Text>{subscriptionConnected}</Text>
        </View>
        <View testID="devise-subscription-update-count">
          <Text>{subscriptionUpdateCount}</Text>
        </View>
        <View testID="devise-sign-in-count">
          <Text>{signInCount}</Text>
        </View>
        <View testID="devise-sign-out-count">
          <Text>{signOutCount}</Text>
        </View>
        <View testID="devise-task-update-count">
          <Text>{taskUpdateCount}</Text>
        </View>
        <View testID="devise-subscribed-task-name">
          <Text>{subscribedTaskName}</Text>
        </View>
        <Pressable testID="devise-sign-in-button" onPress={this.tt.onSignInClicked}>
          <Text>Sign in</Text>
        </Pressable>
        <Pressable testID="devise-sign-out-button" onPress={this.tt.onSignOutClicked}>
          <Text>Sign out</Text>
        </Pressable>
        <Pressable testID="devise-add-disconnected-stale-pool-button" onPress={this.tt.onAddDisconnectedStalePoolClicked}>
          <Text>Add disconnected stale pool</Text>
        </Pressable>
        <Pressable testID="devise-subscribe-to-task-button" onPress={this.tt.onSubscribeToTaskClicked}>
          <Text>Subscribe to task</Text>
        </Pressable>
        <Pressable testID="devise-trigger-task-update-button" onPress={this.tt.onTriggerTaskUpdateClicked}>
          <Text>Trigger task update</Text>
        </Pressable>
        <Pressable testID="devise-sign-out-fail-button" onPress={this.tt.onSignOutFailClicked}>
          <Text>Sign out (fail)</Text>
        </Pressable>
      </Layout>
    )
  }

  onDeviseSignIn = () => this.setState({signInCount: this.state.signInCount + 1})
  onDeviseSignOut = () => this.setState({signOutCount: this.state.signOutCount + 1})
  onSubscribedUserUpdated = async () => {
    await this.loadSubscribedUser()
    this.setState({subscriptionUpdateCount: this.state.subscriptionUpdateCount + 1})
  }
  onSubscribedTaskUpdated = async () => {
    await this.loadSubscribedTask()
    this.setState({taskUpdateCount: this.state.taskUpdateCount + 1})
  }
  onSubscriptionConnected = () => this.setState({subscriptionConnected: "true"})

  onSignInClicked = async () => {
    await Devise.signIn("admin@example.com", "password")
  }

  onSignOutClicked = async () => {
    await Devise.signOut()
  }

  onAddDisconnectedStalePoolClicked = () => {
    const cableConnectionPool = CableConnectionPool.current()
    const stalePool = new CableSubscriptionPool()

    stalePool.connected = true
    stalePool.subscription = {perform: () => {}}
    stalePool.subscriptions = {}
    cableConnectionPool.cableSubscriptionPools.push(stalePool)
    stalePool.onDisconnected()
  }

  onSubscribeToTaskClicked = async () => {
    await this.loadSubscribedTask()
  }

  onTriggerTaskUpdateClicked = async () => {
    const name = `Updated-${Date.now()}`
    const subscribedTask = this.s.subscribedTask || await this.loadSubscribedTask()

    if (!subscribedTask) {
      throw new Error("Expected a subscribed task before triggering an update")
    }

    await Services.current().sendRequest("DeviseEventsUpdateTask", {name, task_id: subscribedTask.id()})
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

  loadSubscribedUser = async () => {
    const subscribedUser = await User.ransack({email_eq: "admin@example.com"}).first()

    this.setState({
      subscribedUser
    })

    return subscribedUser
  }

  loadSubscribedTask = async () => {
    const subscribedTask = await Task.ransack({s: "id desc"}).first()

    this.setState({
      subscribedTask,
      subscribedTaskName: subscribedTask ? subscribedTask.name() : ""
    })

    return subscribedTask
  }
}))
