import React, {useMemo} from "react"
import {Pressable, StyleSheet, View} from "react-native"
import BaseComponent from "../base-component.js"
import ConfigReader from "./config-reader.js"
import EditPage from "./edit-page"
import FlashNotifications from "flash-notifications/build/flash-notifications.js"
import hasEditConfig from "./has-edit-config.js"
import IndexPage from "./index-page"
import Layout from "./layout/index"
import Link from "../link"
import memo from ""set-state-compare/build/memo.js"
// @ts-expect-error
import * as models from "models.js"
import Params from "../params.js"
import {shapeComponent} from ""set-state-compare/build/shape-component.js"
import ShowPage from "./show-page/index"
import ShowReflectionActions from "./show-reflection-actions"
import ShowReflectionPage from "./show-reflection-page"
import Text from "../utils/text"
import useCanCan from "../use-can-can.js"
import useCurrentUser from "../use-current-user.js"
import useQueryParams from "on-location-changed/build/use-query-params.js"
import useStyles from "../use-styles.js"

const styles = StyleSheet.create({
  actionsView: {
    flexDirection: "row",
    alignItems: "center"
  },
  createNewModelLink: {
    marginLeft: 10,
    marginRight: 10
  },
  destroyModelLink: {
    marginLeft: 10,
    marginRight: 10
  },
  editModelLink: {
    marginLeft: 10,
    marginRight: 10
  }
})

export default memo(shapeComponent(class ApiMakerSuperAdmin extends BaseComponent {
  setup() {
    this.queryParams = useQueryParams()

    if (this.queryParams.model) {
      this.modelClass = models[this.queryParams.model]
    } else {
      this.modelClass = null
    }

    this.configReader = useMemo(() => this.modelClass && ConfigReader.forModel(this.modelClass), [this.modelClass])
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
    const {configReader, modelClass, modelId, modelName} = this.tt

    if (modelId && modelClass) {
      const abilities = {}
      const abilitiesForModel = ["destroy", "edit"]
      const layoutSelect = configReader?.modelConfig?.layout?.select

      abilities[modelName] = abilitiesForModel

      const query = await modelClass
        .ransack({id_eq: modelId})
        .abilities(abilities)

      if (layoutSelect) query.select(layoutSelect)

      const model = await query.first()

      this.setState({model})
    } else {
      this.setState({model: undefined})
    }
  }

  render() {
    const {canCan, configReader, modelClass, modelId, modelName, queryParams} = this.tt
    const {model} = this.s
    const modelConfigActions = configReader?.modelConfig?.actions
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

    const actionsViewStyle = useStyles(styles, "actionsView")

    const actions = useMemo(
      () => <View style={actionsViewStyle}>
        {model && modelConfigActions && modelConfigActions({model})}
        {modelClass && pageToShow == "index" &&
          <>
            {canCan?.can("new", modelClass) && hasEditConfig(modelClass) &&
              <Link
                dataSet={{class: "create-new-model-link"}}
                style={styles.createNewModelLink}
                to={Params.withParams({model: modelName, mode: "new"})}
              >
                <Text>
                  Create new
                </Text>
              </Link>
            }
          </>
        }
        {model && pageToShow == "show" &&
          <>
            {model.can("edit") && hasEditConfig(modelClass) &&
              <Link
                dataSet={{class: "edit-model-link"}}
                style={styles.editModelLink}
                to={Params.withParams({model: modelName, model_id: modelId, mode: "edit"})}
              >
                <Text>
                  Edit
                </Text>
              </Link>
            }
            {model.can("destroy") &&
              <Pressable
                dataSet={{class: "destroy-model-link"}}
                onPress={this.tt.onDestroyClicked}
                style={styles.destroyModelLink}
              >
                <Text>
                  Delete
                </Text>
              </Pressable>
            }
          </>
        }
        {pageToShow == "show_reflection" &&
          <ShowReflectionActions model={model} modelClass={modelClass} reflectionName={queryParams.model_reflection} />
        }
      </View>,
      [canCan, configReader?.actions, model, modelClass, pageToShow]
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

  onDestroyClicked = async () => {
    if (!confirm("Are you sure?")) {
      return
    }

    try {
      await this.s.model.destroy()

      Params.changeParams({mode: undefined, model_id: undefined})
    } catch (error) {
      FlashNotifications.errorResponse(error)
    }
  }
}))
