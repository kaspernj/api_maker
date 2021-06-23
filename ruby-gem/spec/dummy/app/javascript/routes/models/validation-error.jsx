import {digg, digs} from "@kaspernj/object-digger"
import FlashMessage from "shared/flash-message"
import {Params, ValidationError} from "@kaspernj/api-maker"
import {User} from "api-maker/models"

export default class ModelsCustomValidationError extends React.Component {
  state = {
    account: undefined,
    errorForProjectName: undefined,
    project: new Project()
  }

  componentDidMount() {
    this.loadAccount()
  }

  async loadAccount() {
    const account = await Account.ransack().first()

    if (!account) {
      throw new Error("No account")
    }

    this.setState({account})
  }

  render() {
    const {account} = digs(this.state, "account")

    return (
      <Layout className="routes-models-custom-validation-error">
        {account &&
          this.content()
        }
      </Layout>
    )
  }

  content() {
    const {account, errorForProjectName, project} = digs(this.state, "account", "errorForProjectName", "project")

    return (
      <div className="content-container">
        <form onSubmit={(e) => this.onSubmit(e)}>
          <input type="hidden" name="project[account_id]" value={account.id()} />
          <Input attribute="name" model={project} />

          <div className="error-for-project-name">
            {errorForProjectName &&
              "Yes"
            }
            {!errorForProjectName &&
              "No"
            }
          </div>

          <button className="submit-button">
            Save
          </button>
        </form>
      </div>
    )
  }

  async onSubmit(e) {
    e.preventDefault()

    const {project} = digs(this.state, "project")
    const form = digg(e, "target")

    try {
      await project.saveRaw(form)
      this.setState({errorForProjectName: false})
    } catch(error) {
      FlashMessage.errorResponse(error)

      if (error instanceof ValidationError) {
        this.setState({
          errorForProjectName: error.hasValidationErrorForAttribute("name")
        })
      } else {
        throw error
      }
    }
  }
}
