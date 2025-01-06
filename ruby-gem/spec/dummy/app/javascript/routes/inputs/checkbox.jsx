import Checkbox from "@kaspernj/api-maker/build/bootstrap/checkbox"
import {digg, digs} from "diggerize"
import Params from "@kaspernj/api-maker/build/params"

export default class RoutesInputsCheckbox extends React.PureComponent {
  params = Params.parse()
  autoRefresh = Boolean(this.params.auto_refresh)
  autoSubmit = Boolean(this.params.auto_submit)
  projectId = digg(this, "params", "project_id")

  state = {
    project: undefined
  }

  componentDidMount() {
    this.loadProject()
  }

  async loadProject() {
    const {projectId} = digs(this, "projectId")
    const project = await Project.find(projectId)

    this.setState({project})
  }

  render() {
    const {autoRefresh, autoSubmit} = digs(this, "autoRefresh", "autoSubmit")
    const {project} = digs(this.state, "project")

    return (
      <Layout>
        {project &&
          <Checkbox autoRefresh={autoRefresh} autoSubmit={autoSubmit} attribute="public" model={project} />
        }
      </Layout>
    )
  }
}
