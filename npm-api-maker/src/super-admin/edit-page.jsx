import BaseComponent from "../base-component"
import ConfigReader from "./config-reader.jsx"
import {digg} from "diggerize"
import EditAttribute from "./edit-page/edit-attribute"
import * as inflection from "inflection"
import {Pressable, Text, View} from "react-native"
import Locales from "shared/locales"
import {memo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import useCurrentUser from "../use-current-user"
import useModel from "../use-model"
import useQueryParams from "on-location-changed/src/use-query-params"

export default memo(shapeComponent(class ApiMakerSuperAdminEditPage extends BaseComponent {
  static propTypes = propTypesExact({
    modelClass: PropTypes.func.isRequired
  })

  inputs = {}

  setup() {
    const {modelClass} = this.p
    const modelClassName = modelClass.modelClassData().name
    const availableLocales = Locales.availableLocales()
    this.configReader = ConfigReader.forModel(modelClass)
    const currentUser = useCurrentUser()
    const queryParams = useQueryParams()
    const selectedModelAttributes = ["id"]
    const selectedAttributes = {}
    this.attributes = this.configReader.modelConfig?.edit?.attributes

    if (!this.attributes) {
      throw new Error(`No 'attributes' given from edit config for ${modelClass.modelClassData().name}`)
    }

    for (const attribute of this.attributes) {
      if (attribute.translated) {
        for (const locale of availableLocales) {
          selectedModelAttributes.push(`${attribute.attribute}${inflection.camelize(locale)}`)
        }
      } else {
        selectedModelAttributes.push(attribute.attribute)
      }
    }

    selectedAttributes[modelClassName] = selectedModelAttributes

    const useModelResult = useModel(modelClass, {
      cacheArgs: [currentUser?.id()],
      loadByQueryParam: (props) => props.queryParams.model_id,
      newIfNoId: true,
      select: selectedAttributes
    })

    const modelIdVarName = `${inflection.camelize(modelClass.modelClassData().name, true)}Id`
    const modelVarName = inflection.camelize(modelClass.modelClassData().name, true)

    this.model = digg(useModelResult, modelVarName)
    this.modelId = queryParams.model_id
    this.modelArgs = {}
    this.modelArgs[modelIdVarName] = this.modelId
  }

  render() {
    const {attributes, model} = this.tt
    const {modelClass} = this.p
    const extraContent = this.configReader.modelConfig?.edit?.extraContentconst

    return (
      <View dataSet={{class: "super-admin--edit-page"}}>
        {model && attributes?.map((attribute) =>
          <EditAttribute attribute={attribute} inputs={this.inputs} key={attribute.attribute} model={model} modelClass={modelClass} />
        )}
        {extraContent && extraContent(modelArgs)}
        <Pressable
          dataSet={{class: "submit-button"}}
          onPress={this.tt.onSubmit}
          style={{
            paddingTop: 18,
            paddingRight: 24,
            paddingBottom: 18,
            paddingLeft: 24,
            borderRadius: 10,
            backgroundColor: "#4c93ff",
            marginTop: 10
          }}
        >
          <Text style={{color: "#fff"}}>
            Submit
          </Text>
        </Pressable>
      </View>
    )
  }

  onSubmit = async () => {
    try {
      const {inputs, model} = this.tt

      model.assignAttributes(inputs)
      await model.save(this.inputs)
      Params.changeParams({mode: undefined, model_id: model.id()})
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }
}))
