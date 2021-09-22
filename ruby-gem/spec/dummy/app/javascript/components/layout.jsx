import {Devise} from "@kaspernj/api-maker"
import FlashMessage from "shared/flash-message"
import { EventEmitterListener } from "@kaspernj/api-maker"
import { Link } from "react-router-dom"
import React from "react"
import Routes from "shared/routes"

export default class Layout extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isUserSignedIn: Devise.isUserSignedIn()
    }
  }

  componentDidMount() {
    this.loadAccount()
    this.loadProject()
    this.loadTask()
  }

  async loadAccount() {
    const account = await Account.ransack().first()
    this.setState({account})
  }

  async loadProject() {
    const project = await Task.ransack().first()
    this.setState({project})
  }

  async loadTask() {
    const task = await Task.ransack().first()
    this.setState({task})
  }

  render() {
    const { account, project, task } = this.state

    return (
      <div className={this.className()}>
        <EventEmitterListener events={Devise.events()} event="onDeviseSignIn" onCalled={() => this.onDeviseSigned()} />
        <EventEmitterListener events={Devise.events()} event="onDeviseSignOut" onCalled={() => this.onDeviseSigned()} />

        <div>
          <Link to={Routes.sessionStatusSpecsTimeoutPath()}>
            Timeout
          </Link>
          {task &&
            <>
              <Link className="ml-2" to={Routes.bootstrapCheckboxBooleanPath({task_id: task.id()})}>
                Bootstrap checkbox boolean
              </Link>
              <Link className="ml-2" to={Routes.bootstrapStringInputDatetimeLocalPath({task_id: task.id()})}>
                Bootstrap string input datetime local
              </Link>
              <Link className="ml-2" to={Routes.bootstrapSortLinkPath()}>
                Bootstrap sort link
              </Link>
            </>
          }
          {project &&
            <Link className="ml-2" to={Routes.bootstrapStringInputMoneyPath({project_id: project.id()})}>
              Bootstrap string input money
            </Link>
          }
          {account &&
            <Link className="ml-2" to={Routes.bootstrapCheckboxesPath({account_id: account.id()})}>
              Checkboxes
            </Link>
          }
          <Link className="ml-2" to={Routes.bootstrapLiveTablePath()}>
            Bootstrap live table
          </Link>

          <Link to={Routes.modelsValidationErrorsPath()}>
            Validation errors (new)
          </Link>
          {Devise.isUserSignedIn() &&
            <>
              <Link to={Routes.modelsValidationErrorsPath(Devise.currentUser().id())}>
                Validation errors (edit)
              </Link>
              <a className="ml-2" href="#" onClick={(e) => this.onSignOutClicked(e)}>
                Sign out
              </a>
            </>
          }
          {!Devise.isUserSignedIn() &&
            <Link className="ml-2" to={Routes.newSessionPath()}>
              Sign in
            </Link>
          }
        </div>

        {this.props.children}
      </div>
    )
  }

  className() {
    const classNames = ["component-layout"]

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
      FlashMessage.success("You were signed out")
    }, (response) => {
      FlashMessage.errorResponse(response)
    })
  }
}
