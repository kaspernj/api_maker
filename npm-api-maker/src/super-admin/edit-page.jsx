/* eslint-disable react/jsx-max-depth, react/jsx-no-literals, react/jsx-one-expression-per-line, sort-imports */
import * as inflection from "inflection"
import {FlashNotifications} from "flash-notifications"
import {Form} from "../form"
import FormDataObjectizer from "form-data-objectizer"
import {incorporate} from "incorporator"
import {Pressable, View} from "react-native"
import {digg} from "diggerize"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import BaseComponent from "../base-component"
import ConfigReader from "./config-reader"
import EditAttribute from "./edit-page/edit-attribute"
// @ts-expect-error
import Locales from "shared/locales.js" // eslint-disable-line import/no-unresolved
import Params from "../params.js"
import PropTypes from "prop-types"
import React, {useRef} from "react"
import Text from "../utils/text"
import memo from "set-state-compare/build/memo.js"
import propTypesExact from "prop-types-exact"
import useCurrentUser from "../use-current-user.js"
import useModel from "../use-model.js"

export default memo(shapeComponent(class ApiMakerSuperAdminEditPage extends BaseComponent {
  static propTypes = propTypesExact({
    modelClass: PropTypes.func.isRequired,
    modelId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  })

  setup() {
    const {modelClass, modelId} = this.p
    const modelClassName = modelClass.modelClassData().name
    const availableLocales = Locales.availableLocales()
    this.configReader = ConfigReader.forModel(modelClass)
    const currentUser = useCurrentUser()
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
      cacheArgs: [currentUser?.primaryKey(), modelId],
      loadByQueryParam: () => modelId,
      newIfNoId: this.configReader.modelConfig?.edit?.newIfNoId ?? true,
      preload: this.configReader.modelConfig?.edit?.preload,
      select: selectedAttributes
    })

    const modelIdVarName = `${inflection.camelize(modelClass.modelClassData().name, true)}Id`
    const modelVarName = inflection.camelize(modelClass.modelClassData().name, true)

    this.model = digg(useModelResult, modelVarName)
    this.modelId = modelId
    this.modelArgs = {}
    this.modelArgs[modelIdVarName] = this.modelId
    this.formRef = useRef(null)
    this.formObjectRef = useRef(null)
  }

  render() {
    const {attributes, model} = this.tt
    const {modelClass} = this.p
    const extraContent = this.configReader.modelConfig?.edit?.extraContent

    return (
      <View testID="super-admin--edit-page">
        <Form formObjectRef={this.formObjectRef} formRef={this.formRef}>
          {model && attributes?.map((attribute) => (
            <EditAttribute attribute={attribute} key={attribute.attribute} model={model} modelClass={modelClass} />
          ))}
          {extraContent && extraContent(this.modelArgs)}
          <Pressable
            onPress={this.tt.onSubmit}
            style={this.cache("pressableStyle", {
              paddingTop: 18,
              paddingRight: 24,
              paddingBottom: 18,
              paddingLeft: 24,
              borderRadius: 10,
              backgroundColor: "#4c93ff",
              marginTop: 10
            })}
            testID="submit-button"
          >
            <Text style={this.cache("buttonTextStyle", {color: "#fff"})}>Submit</Text>
          </Pressable>
        </Form>
      </View>
    )
  }

  onSubmit = async () => {
    try {
      const {model} = this.tt
      const formData = new FormData(this.formRef.current)
      // Read the uncontrolled form object directly from the stable ref so submit does not depend on a mount-time state sync.
      const formObject = incorporate({}, this.formObjectRef.current?.asObject() || {}, FormDataObjectizer.toObject(formData))

      model.assignAttributes(formObject)
      await model.save()
      Params.changeParams({mode: undefined, model_id: model.id()})
    } catch (error) {
      FlashNotifications.errorResponse(error)
    }
  }
}))
