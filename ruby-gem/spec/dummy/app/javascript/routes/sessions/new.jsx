import React, {memo, useRef} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import Checkbox from "@kaspernj/api-maker/build/bootstrap/checkbox"
import Devise from "@kaspernj/api-maker/build/devise.js"
import {FlashNotifications} from "flash-notifications"
import Input from "@kaspernj/api-maker/build/bootstrap/input"
import Layout from "components/layout"
import useEventEmitter from "ya-use-event-emitter"

/** @typedef {object} SessionsNewProps */

/**
 * @typedef {object} SessionsNewState
 * @property {boolean} isUserSignedIn
 */

/** @augments {ShapeComponent<SessionsNewProps, SessionsNewState>} */
class SessionsNew extends ShapeComponent {
  state = /** @type {SessionsNewState} */ ({
    isUserSignedIn: Devise.isUserSignedIn()
  })

  setup() {
    this.emailRef = useRef()
    this.passwordRef = useRef()
    this.rememberMeRef = useRef()

    useEventEmitter(Devise.events(), "onDeviseSignIn", this.tt.onDeviseSigned)
    useEventEmitter(Devise.events(), "onDeviseSignOut", this.tt.onDeviseSigned)
  }

  render() {
    return (
      <Layout>
        {Devise.isUserSignedIn() &&
          <div>
            You are signed in as {Devise.currentUser().email()}
          </div>
        }
        {!Devise.isUserSignedIn() &&
          <form onSubmit={this.onSubmit}>
            <Input inputRef={this.emailRef} label="Email" />
            <Input inputRef={this.passwordRef} label="Password" type="password" />
            <Checkbox label="Remember me" inputRef={this.rememberMeRef} />
            <input type="submit" value="Sign in" />
          </form>
        }
      </Layout>
    )
  }

  onDeviseSigned = () => this.setState({isUserSignedIn: Devise.isUserSignedIn()})

  onSubmit = async (e) => {
    e.preventDefault()

    const email = this.emailRef.current.value
    const password = this.passwordRef.current.value
    const rememberMe = this.rememberMeRef.current.checked

    try {
      await Devise.signIn(email, password, {rememberMe})
      FlashNotifications.success("You were signed in")
    } catch (error) {
      FlashNotifications.errorResponse(error)
    }
  }
}

export default memo(shapeComponent(SessionsNew))
