import {Devise} from "@kaspernj/api-maker"
import FlashMessage from "shared/flash-message"
import { EventEmitterListener } from "@kaspernj/api-maker"
import React from "react"

export default class SessionsNew extends React.PureComponent {
  emailRef = React.createRef()
  passwordRef = React.createRef()
  rememberMeRef = React.createRef()

  constructor(props) {
    super(props)
    this.state = {
      isUserSignedIn: Devise.isUserSignedIn()
    }
  }

  render() {
    return (
      <Layout>
        <EventEmitterListener events={Devise.events()} event="onDeviseSignIn" onCalled={() => { this.onDeviseSigned() }} />
        <EventEmitterListener events={Devise.events()} event="onDeviseSignOut" onCalled={() => { this.onDeviseSigned() }} />

        {Devise.isUserSignedIn() &&
          <div>
            You are signed in as {Devise.currentUser().email()}
          </div>
        }
        {!Devise.isUserSignedIn() &&
          <form onSubmit={(e) => { this.onSubmit(e) }}>
            <Input inputRef={this.emailRef} label="Email" />
            <Input inputRef={this.passwordRef} label="Password" type="password" />
            <Checkbox label="Remember me" inputRef={this.rememberMeRef} />
            <input type="submit" value="Sign in" />
          </form>
        }
      </Layout>
    )
  }

  onDeviseSigned() {
    this.setState({isUserSignedIn: Devise.isUserSignedIn()})
  }

  onSubmit(e) {
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
}
