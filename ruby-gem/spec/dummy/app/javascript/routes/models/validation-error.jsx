import {Account} from "@kaspernj/api-maker/src/models.mjs.erb"
import {digg, digs} from "diggerize"
import Input from "@kaspernj/api-maker/src/bootstrap/input"
import FlashMessage from "shared/flash-message"
import ValidationError from "@kaspernj/api-maker/src/validation-error"

export default class ModelsCustomValidationError extends React.PureComponent {
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
        <form onSubmit={this.onSubmit}>
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

  onSubmit = async (e) => {
    e.preventDefault()

    const {project} = digs(this.state, "project")
    const form = digg(e, "target")
    const formData = new FormData(form)

    try {
      await Project.createProject(formData)
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
