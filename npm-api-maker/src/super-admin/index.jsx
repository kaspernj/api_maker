import {digg, digs} from "diggerize"
import IndexPage from "./index-page"
import Layout from "./layout"
import * as modelsModule from "@kaspernj/api-maker/src/models.mjs.erb"
import PropTypes from "prop-types"
import ShowPage from "./show-page"
import ShowReflectionPage from "./show-reflection-page"
import withQueryParams from "on-location-changed/src/with-query-params"

class ApiMakerSuperAdmin extends React.PureComponent {
  static propTypes = {
    currentUser: PropTypes.object,
    queryParams: PropTypes.object.isRequired
  }

  render() {
    const {currentUser} = this.props
    const {queryParams} = digs(this.props, "queryParams")
    const pageToShow = this.pageToShow()
    let modelClass

    if (queryParams.model) modelClass = modelsModule[queryParams.model]

    return (
      <Layout headerTitle={modelClass?.modelName()?.human({count: 2})}>
        {pageToShow == "index" &&
          <IndexPage
            currentUser={currentUser}
            key={`index-page-${digg(modelClass.modelClassData(), "name")}`}
            modelClass={modelClass}
            queryParams={queryParams}
          />
        }
        {pageToShow == "show" &&
          <ShowPage
            key={`show-page-${digg(modelClass.modelClassData(), "name")}-${queryParams.modelId}`}
            modelClass={modelClass}
            modelId={queryParams.modelId}
            queryParams={queryParams}
          />
        }
        {pageToShow == "show_reflection" &&
          <ShowReflectionPage
            currentUser={currentUser}
            key={`show-reflection-page-${digg(modelClass.modelClassData(), "name")}-${queryParams.modelId}`}
            modelClass={modelClass}
            modelId={queryParams.modelId}
            queryParams={queryParams}
          />
        }
      </Layout>
    )
  }

  pageToShow() {
    const {queryParams} = digs(this.props, "queryParams")

    if (queryParams.model && queryParams.model_id && queryParams.model_reflection) {
      return "show_reflection"
    } else if (queryParams.model && queryParams.model_id) {
      return "show"
    } else if (queryParams.model) {
      return "index"
    }

    return "welcome"
  }
}

export default withQueryParams(ApiMakerSuperAdmin)
