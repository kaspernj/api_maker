import {digg} from "diggerize"
import EditPage from "./edit-page"
import IndexPage from "./index-page"
import Layout from "./layout"
import Link from "../link"
import {memo, useMemo} from "react"
import * as modelsModule from "@kaspernj/api-maker/src/models.mjs.erb"
import ShowPage from "./show-page"
import ShowReflectionPage from "./show-reflection-page"
import useQueryParams from "on-location-changed/src/use-query-params"

const ApiMakerSuperAdmin = () => {
  const queryParams = useQueryParams()
  let modelClass, pageToShow

  if (queryParams.model) modelClass = modelsModule[queryParams.model]

  if (queryParams.model && queryParams.model_id && queryParams.model_reflection) {
    pageToShow = "show_reflection"
  } else if (queryParams.model && queryParams.model_id) {
    pageToShow = "show"
  } else if (queryParams.model && queryParams.mode == "new") {
    pageToShow = "edit"
  } else if (queryParams.model) {
    pageToShow = "index"
  } else {
    pageToShow = "welcome"
  }

  const actions = useMemo(
    () => <>
      {modelClass && pageToShow == "index" &&
        <Link to={Params.withParams({model: modelClass.modelClassData().name, mode: "new"})}>
          Create new
        </Link>
      }
    </>,
    [modelClass, pageToShow]
  )

  return (
    <Layout actions={actions} active={queryParams.model} headerTitle={modelClass?.modelName()?.human({count: 2})}>
      {pageToShow == "index" &&
        <IndexPage
          key={`index-page-${digg(modelClass.modelClassData(), "name")}`}
          modelClass={modelClass}
        />
      }
      {pageToShow == "show" &&
        <ShowPage
          key={`show-page-${digg(modelClass.modelClassData(), "name")}-${queryParams.modelId}`}
          modelClass={modelClass}
          modelId={queryParams.modelId}
        />
      }
      {pageToShow == "show_reflection" &&
        <ShowReflectionPage
          key={`show-reflection-page-${digg(modelClass.modelClassData(), "name")}-${queryParams.modelId}`}
          modelClass={modelClass}
          modelId={queryParams.modelId}
        />
      }
      {pageToShow == "edit" &&
        <EditPage
          key={`edit-page-${digg(modelClass.modelClassData(), "name")}-${queryParams.modelId}`}
          modelClass={modelClass}
        />
      }
    </Layout>
  )
}

export default memo(ApiMakerSuperAdmin)
