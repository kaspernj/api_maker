import Devise from "api-maker/devise"
import EventEmitterListener from "api-maker/event-emitter-listener"
import React from "react"

export default class SessionsNew extends React.Component {
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
            <StringInput label="Email" ref="email" />
            <StringInput label="Password" ref="password" type="password" />
            <Checkbox label="Remember me" ref="rememberMe" />
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

    var email = this.refs.email.refs.input.value
    var password = this.refs.password.refs.input.value
    var rememberMe = this.refs.rememberMe.refs.input.checked

    Devise.signIn(email, password, {rememberMe}).then(() => {
      DisplayNotification.success("You were signed in")
    }, (response) => {
      DisplayNotification.error(response)
    })
  }
}
