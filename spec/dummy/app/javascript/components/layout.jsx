import Devise from "api-maker/devise"
import EventEmitterListener from "api-maker/event-emitter-listener"
import { Link } from "react-router-dom"
import React from "react"

export default class Layout extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isUserSignedIn: Devise.isUserSignedIn()
    }
  }

  componentDidMount() {
    this.loadTask()
  }

  async loadTask() {
    var tasks = await Task.ransack().toArray()
    var task = tasks[0]

    this.setState({task})
  }

  render() {
    var { task } = this.state

    return (
      <div className={this.className()}>
        <EventEmitterListener events={Devise.events()} event="onDeviseSignIn" onCalled={() => { this.onDeviseSigned() }} />
        <EventEmitterListener events={Devise.events()} event="onDeviseSignOut" onCalled={() => { this.onDeviseSigned() }} />

        <div>
          <Link to={Routes.sessionStatusSpecsTimeoutPath()}>
            Timeout
          </Link>
          {task &&
            <Link to={Routes.bootstrapCheckboxBooleanPath({task_id: task.id()})}>
              Bootstrap checkbox boolean
            </Link>
          }

          {Devise.isUserSignedIn() &&
            <a href="#" onClick={(e) => { this.onSignOutClicked(e) }}>
              Sign out
            </a>
          }
          {!Devise.isUserSignedIn() &&
            <Link to={Routes.newSessionPath()}>
              Sign in
            </Link>
          }
        </div>

        {this.props.children}
      </div>
    )
  }

  className() {
    var classNames = ["component-layout"]

    if (this.props.className)
      classNames.push(this.props.className)

    return classNames.join(" ")
  }

  onDeviseSigned() {
    this.setState({isUserSignedIn: Devise.isUserSignedIn()})
  }

  onSignOutClicked(e) {
    e.preventDefault()

    Devise.signOut().then(() => {
      DisplayNotification.success("You were signed out")
    }, (response) => {
      DisplayNotification.error(response)
    })
  }
}
