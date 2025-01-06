import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import Devise from "@kaspernj/api-maker/build/devise"
import FlashMessage from "shared/flash-message"
import Link from "@kaspernj/api-maker/build/link"
import {memo} from "react"
import Routes from "shared/routes"
import useEventEmitter from "@kaspernj/api-maker/build/use-event-emitter"

export default memo(shapeComponent(class Layout extends ShapeComponent {
  setup() {
    this.useStates({
      isUserSignedIn: Devise.isUserSignedIn()
    })

    useEventEmitter(Devise.events(), "onDeviseSignIn", this.tt.onDeviseSigned)
    useEventEmitter(Devise.events(), "onDeviseSignOut", this.tt.onDeviseSigned)
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
              <a className="ml-2" href="#" onClick={this.onSignOutClicked}>
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

  onDeviseSigned = () => this.setState({isUserSignedIn: Devise.isUserSignedIn()})

  onSignOutClicked = (e) => {
    e.preventDefault()

    Devise.signOut().then(() => {
      FlashMessage.success("You were signed out")
    }, (response) => {
      FlashMessage.errorResponse(response)
    })
  }
}))
