import {digs} from "diggerize"
import IndexPage from "./index-page"
import Layout from "./layout"
import * as modelsModule from "@kaspernj/api-maker/src/models.mjs.erb"
import ShowPage from "./show-page"
import withQueryParams from "on-location-changed/src/with-query-params"

class ApiMakerSuperAdmin extends React.PureComponent {
  static propTypes = {
    currentUser: PropTypes.object
  }

  render() {
    const {currentUser} = this.props
    const {queryParams} = digs(this.props, "queryParams")
    const pageToShow = this.pageToShow()
    let modelClass

    if (queryParams.model) modelClass = modelsModule[queryParams.model]

    return (
      <Layout>
        {pageToShow == "index" &&
          <IndexPage currentUser={currentUser} modelClass={modelClass} queryParams={queryParams} />
        }
        {pageToShow == "show" &&
          <ShowPage modelClass={modelClass} modelId={queryParams.modelId} />
        }
      </Layout>
    )
  }

  pageToShow() {
    const {queryParams} = digs(this.props, "queryParams")

    if (queryParams.model && queryParams.model_id) {
      return "show"
    } else if (queryParams.model) {
      return "index"
    }

    return "welcome"
  }
}

export default withQueryParams(ApiMakerSuperAdmin)
