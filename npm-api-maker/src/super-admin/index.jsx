import BaseComponent from "../base-component"
import EditPage from "./edit-page"
import hasEditConfig from "./has-edit-config.js"
import IndexPage from "./index-page"
import Layout from "./layout"
import Link from "../link"
import {memo, useMemo} from "react"
import * as modelsModule from "@kaspernj/api-maker/src/models.mjs.erb"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import ShowPage from "./show-page"
import ShowReflectionActions from "./show-reflection-actions"
import ShowReflectionPage from "./show-reflection-page"
import useCanCan from "../use-can-can"
import useCurrentUser from "../use-current-user.mjs"
import useQueryParams from "on-location-changed/src/use-query-params"

export default memo(shapeComponent(class ApiMakerSuperAdmin extends BaseComponent {
  setup() {
    this.queryParams = useQueryParams()

    if (this.queryParams.model) {
      this.modelClass = modelsModule[this.queryParams.model]
    } else {
      this.modelClass = null
    }

    this.modelId = this.queryParams.model_id
    this.modelName = this.modelClass?.modelClassData()?.name
    this.currentUser = useCurrentUser()

    this.canCan = useCanCan(
      () => {
        const abilities = []

        if (this.modelClass) abilities.push([this.modelClass, ["new"]])

        return abilities
      },
      [this.currentUser?.id(), this.modelClass]
    )

    this.useStates({
      model: undefined
    })
    useMemo(
      () => { this.loadModel() },
      [this.modelId]
    )
  }

  loadModel = async () => {
    const {modelClass, modelId, modelName} = this.tt

    if (modelId && modelClass) {
      const abilities = {}
      const abilitiesForModel = ["destroy", "edit"]

      abilities[modelName] = abilitiesForModel

      const model = await modelClass
        .ransack({id_eq: modelId})
        .abilities(abilities)
        .first()

      this.setState({model})
    } else {
      this.setState({model: undefined})
    }
  }

  render() {
    const {canCan, modelClass, modelId, modelName, queryParams} = this.tt
    const {model} = this.s
    let pageToShow

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

    const actions = useMemo(
      () => <>
        {modelClass && pageToShow == "index" &&
          <>
            {canCan?.can("new", modelClass) && hasEditConfig(modelClass) &&
              <Link className="create-new-model-link" to={Params.withParams({model: modelName, mode: "new"})}>
                Create new
              </Link>
            }
          </>
        }
        {model && pageToShow == "show" &&
          <>
            {model.can("edit") && hasEditConfig(modelClass) &&
              <Link className="edit-model-link" to={Params.withParams({model: modelName, model_id: modelId, mode: "edit"})}>
                Edit
              </Link>
            }
            {model.can("destroy") &&
              <a className="destroy-model-link" href="#" onClick={this.tt.onDestroyClicked}>
                Delete
              </a>
            }
          </>
        }
        {pageToShow == "show_reflection" &&
          <ShowReflectionActions model={model} modelClass={modelClass} reflectionName={queryParams.model_reflection} />
        }
      </>,
      [canCan, model, modelClass, pageToShow]
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

  onDestroyClicked = async (e) => {
    e.preventDefault()

    if (!confirm("Are you sure?")) {
      return
    }

    try {
      await this.s.model.destroy()

      Params.changeParams({mode: undefined, model_id: undefined})
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }
}))
