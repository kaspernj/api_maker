import AttributeRow from "../../bootstrap/attribute-row"
import BaseComponent from "../../base-component"
import BelongsToAttributeRow from "./belongs-to-attribute-row"
import ConfigReader from "../config-reader.jsx"
import {digg} from "diggerize"
import * as inflection from "inflection"
import PropTypes from "prop-types"
import {memo, useMemo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import ShowNav from "../show-nav"
import useModel from "../../use-model"
import {View} from "react-native"

const AttributePresenter = memo(({attribute, model, modelArgs}) => {
  const attributeRowProps = {
    model
  }

  if (typeof attribute == "object") {
    if (attribute.attribute) attributeRowProps.attribute = attribute.attribute
    if (attribute.content) attributeRowProps.children = attribute.content(modelArgs)
    if (attribute.label) attributeRowProps.label = attribute.label
  } else if (attribute) {
    attributeRowProps.attribute = attribute
  }

  return (
    <AttributeRow {...attributeRowProps} />
  )
})

export default memo(shapeComponent(class ApiMakerSuperAdminShowPage extends BaseComponent {
  static propTypes = {
    modelClass: PropTypes.func.isRequired
  }

  setup() {
    const {modelClass} = this.props
    const configReader = useMemo(() => ConfigReader.forModel(modelClass), [modelClass])
    const showConfig = configReader.modelConfig?.show

    this.setInstance({configReader, showConfig})
  }

  render() {
    const {modelClass} = this.props
    const {configReader, showConfig} = this.tt
    const attributes = configReader.attributesToShow()
    const extraContent = showConfig?.extraContent
    const modelClassName = modelClass.modelClassData().name
    const primaryKeyName = modelClass.primaryKey()
    const preload = []
    const select = showConfig?.extraSelect || {}
    const modelClassSelect = select[modelClassName] || []

    if (showConfig?.preload) {
      for (const showConfigPreload of showConfig.preload) {
        preload.push(showConfigPreload)
      }
    }

    if (!(modelClassName in select)) select[modelClassName] = modelClassSelect
    if (!modelClassSelect.includes(primaryKeyName)) modelClassSelect.push(primaryKeyName)

    // Select all attributes selected by default because they will be shown by default
    for (const attribute of modelClass.attributes()) {
      if ((attribute.isSelectedByDefault() || attribute.name() == "name") && !modelClassSelect.includes(attribute.name())) {
        modelClassSelect.push(attribute.name())
      }
    }

    for (const reflection of modelClass.reflections()) {
      if (reflection.macro() == "belongs_to") {
        const reflectionModelClass = reflection.modelClass()
        const reflectionModelClassName = reflectionModelClass.modelClassData().name
        const reflectionModelClassAttributes = reflectionModelClass.attributes()
        const nameAttribute = reflectionModelClassAttributes.find((attribute) => attribute.name() == "name")

        preload.push(inflection.underscore(reflection.name()))

        if (!(reflectionModelClassName in select)) select[reflectionModelClassName] = []
        if (!select[reflectionModelClassName].includes("id")) select[reflectionModelClassName].push("id")
        if (nameAttribute && !select[reflectionModelClassName].includes("name")) select[reflectionModelClassName].push("name")

        // The foreign key is needed to look up any belongs-to-relationships
        if (!modelClassSelect.includes(reflection.foreignKey())) {
          const foreignKeyAttribute = reflectionModelClassAttributes.find((attribute) => attribute.name() == reflection.foreignKey())

          if (!foreignKeyAttribute) {
            throw new Error(`${reflection.foreignKey()} wasn't defined as an attribute on ${modelClassName}`)
          }

          modelClassSelect.push(reflection.foreignKey())
        }
      } else if (reflection.macro() == "has_one") {
        const reflectionModelClass = reflection.modelClass()
        const reflectionModelClassName = reflectionModelClass.modelClassData().name
        const reflectionModelClassAttributes = reflectionModelClass.attributes()
        const nameAttribute = reflectionModelClassAttributes.find((attribute) => attribute.name() == "name")

        preload.push(inflection.underscore(reflection.name()))

        if (!(reflectionModelClassName in select)) select[reflectionModelClassName] = []
        if (!select[reflectionModelClassName].includes("id")) select[reflectionModelClassName].push("id")
        if (nameAttribute && !select[reflectionModelClassName].includes("name")) select[reflectionModelClassName].push("name")

        // The foreign key is needed to look up any has-one-relationships
        if (!modelClassSelect.includes(reflection.foreignKey()) && !select[reflectionModelClassName].includes(reflection.foreignKey()) && !reflection.through()) {
          select[reflectionModelClassName].push(reflection.foreignKey())
        }
      }
    }

    const useModelResult = useModel(modelClass, {
      loadByQueryParam: ({queryParams}) => queryParams.model_id,
      preload,
      select
    })
    const camelizedLower = digg(modelClass.modelClassData(), "camelizedLower")
    const model = digg(useModelResult, camelizedLower)
    const modelArgs = {}

    modelArgs[inflection.camelize(modelClass.modelClassData().name, true)] = model

    return (
      <View dataSet={{component: "super-admin--show-page"}}>
        {model &&
          <ShowNav model={model} modelClass={modelClass} />
        }
        {attributes && model && attributes.map((attribute) =>
          <AttributePresenter attribute={attribute} key={attribute.key || attribute.attribute || attribute} modelArgs={modelArgs} model={model} />
        )}
        {model && modelClass.reflections().filter((reflection) => reflection.macro() == "belongs_to" || reflection.macro() == "has_one").map((reflection) =>
          <BelongsToAttributeRow key={reflection.name()} model={model} modelClass={modelClass} reflection={reflection} />
        )}
        {model && extraContent && extraContent(modelArgs)}
      </View>
    )
  }
}))
