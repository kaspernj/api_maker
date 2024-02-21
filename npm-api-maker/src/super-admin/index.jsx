import EditPage from "./edit-page"
import IndexPage from "./index-page"
import Layout from "./layout"
import Link from "../link"
import {memo, useMemo} from "react"
import * as modelsModule from "@kaspernj/api-maker/src/models.mjs.erb"
import {useCallback} from "react"
import ShowPage from "./show-page"
import ShowReflectionPage from "./show-reflection-page"
import useQueryParams from "on-location-changed/src/use-query-params"

const ApiMakerSuperAdmin = () => {
  const queryParams = useQueryParams()
  let modelClass, pageToShow

  if (queryParams.model) modelClass = modelsModule[queryParams.model]

  const modelId = queryParams.model_id
  const modelName = modelClass?.modelClassData()?.name

  if (queryParams.model && queryParams.model_id && queryParams.model_reflection) {
    pageToShow = "show_reflection"
  } else if (queryParams.model && queryParams.model_id && queryParams.mode == "edit") {
    pageToShow = "edit"
  } else if (queryParams.model && queryParams.model_id) {
    pageToShow = "show"
  } else if (queryParams.model && queryParams.mode == "new") {
    pageToShow = "edit"
  } else if (queryParams.model) {
    pageToShow = "index"
  } else {
    pageToShow = "welcome"
  }

  const onDestroyClicked = useCallback(async (e) => {
    e.preventDefault()

    if (!confirm("Are you sure?")) {
      return
    }

    try {
      const model = await modelClass.find(modelId)

      await model.destroy()

      Params.changeParams({mode: undefined, model_id: undefined})
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }, [modelName, modelId])

  const actions = useMemo(
    () => <>
      {modelClass && pageToShow == "index" &&
        <Link className="create-new-model-link" to={Params.withParams({model: modelName, mode: "new"})}>
          Create new
        </Link>
      }
      {modelClass && pageToShow == "show" &&
        <>
          <Link className="edit-model-link" to={Params.withParams({model: modelName, model_id: modelId, mode: "edit"})}>
            Edit
          </Link>
          <a className="destroy-model-link" href="#" onClick={onDestroyClicked}>
            Delete
          </a>
        </>
      }
    </>,
    [modelClass, pageToShow]
  )

  return (
    <Layout actions={actions} active={queryParams.model} headerTitle={modelClass?.modelName()?.human({count: 2})}>
      {pageToShow == "index" &&
        <IndexPage
          key={`index-page-${modelName}`}
          modelClass={modelClass}
        />
      }
      {pageToShow == "show" &&
        <ShowPage
          key={`show-page-${modelName}-${modelId}`}
          modelClass={modelClass}
          modelId={modelId}
        />
      }
      {pageToShow == "show_reflection" &&
        <ShowReflectionPage
          key={`show-reflection-page-${modelName}-${modelId}`}
          modelClass={modelClass}
          modelId={modelId}
        />
      }
      {pageToShow == "edit" &&
        <EditPage
          key={`edit-page-${modelName}-${modelId}`}
          modelClass={modelClass}
        />
      }
    </Layout>
  )
}

export default memo(ApiMakerSuperAdmin)
