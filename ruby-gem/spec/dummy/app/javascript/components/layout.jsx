import React, {memo} from "react"
import {shapeComponent, ShapeComponent} from ""set-state-compare/build/shape-component.js"
import {FlashNotifications} from "flash-notifications"
import Link from "@kaspernj/api-maker/build/link"
import modelClassRequire from "@kaspernj/api-maker/build/model-class-require.js"
import Routes from "shared/routes"
import useCurrentUser from "@kaspernj/api-maker/build/use-current-user.js"

const Account = modelClassRequire("Account")
const Project = modelClassRequire("Project")
const Task = modelClassRequire("Task")

export default memo(shapeComponent(class Layout extends ShapeComponent {
  setup() {
    this.currentUser = useCurrentUser()
    this.useStates({
      account: null,
      project: null,
      task: null
    })
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
    const project = await Project.ransack().first()
    this.setState({project})
  }

  async loadTask() {
    const task = await Task.ransack().first()
    this.setState({task})
  }

  render() {
    const {currentUser} = this.tt
    const {account, project, task} = this.state

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
          {currentUser &&
            <>
              <Link to={Routes.modelsValidationErrorsPath(currentUser.id())}>
                Validation errors (edit)
              </Link>
              <a className="ml-2" href="#" onClick={this.tt.onSignOutClicked}>
                Sign out
              </a>
            </>
          }
          {!currentUser &&
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

  onSignOutClicked = async (e) => {
    e.preventDefault()

    try {
      await Devise.signOut()
      FlashNotifications.success("You were signed out")
    } catch (error) {
      FlashNotifications.errorResponse(error)
    }
  }
}))
