import Devise from "./devise"
import {digs} from "diggerize"
import EventEmitterListener from "./event-emitter-listener"
import PureComponent from "set-state-compare/src/pure-component"
import React from "react"

export default (WrappedComponent) => class WithCurrentUser extends PureComponent {
  state = {
    currentUser: Devise.currentUser()
  }

  render() {
    const {onDeviseSigned} = digs(this, "onDeviseSigned")
    const {currentUser} = digs(this.state, "currentUser")

    return (
      <>
        <EventEmitterListener events={Devise.events()} event="onDeviseSignIn" onCalled={onDeviseSigned} />
        <EventEmitterListener events={Devise.events()} event="onDeviseSignOut" onCalled={onDeviseSigned} />
        <WrappedComponent {...this.props} currentUser={currentUser} />
      </>
    )
  }

  onDeviseSigned = () => {
    const currentUser = Devise.currentUser()

    if (this.state.currentUser !== currentUser) this.setState({currentUser})
  }
}
