import React, {memo, useRef} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import Checkbox from "@kaspernj/api-maker/build/bootstrap/checkbox"
import Devise from "@kaspernj/api-maker/build/devise"
import FlashMessage from "shared/flash-message"
import Input from "@kaspernj/api-maker/build/bootstrap/input"
import Layout from "components/layout"
import useEventEmitter from "@kaspernj/api-maker/build/use-event-emitter"

export default memo(shapeComponent(class SessionsNew extends ShapeComponent {
  setup() {
    this.emailRef = useRef()
    this.passwordRef = useRef()
    this.rememberMeRef = useRef()
    this.useStates({
      isUserSignedIn: Devise.isUserSignedIn()
    })

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

  onSubmit = (e) => {
    e.preventDefault()

    const email = this.emailRef.current.value
    const password = this.passwordRef.current.value
    const rememberMe = this.rememberMeRef.current.checked

    Devise.signIn(email, password, {rememberMe}).then(() => {
      FlashMessage.success("You were signed in")
    }, (response) => {
      FlashMessage.errorResponse(response)
    })
  }
}))
