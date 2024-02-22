import ConfigReader from "./config-reader"
import {digg} from "diggerize"
import * as inflection from "inflection"
import {Button, Text, TextInput, View} from "react-native"
import Locales from "shared/locales"
import {memo, useCallback, useMemo, useState} from "react"
import useCurrentUser from "../use-current-user"
import useModel from "../use-model"
import useQueryParams from "on-location-changed/src/use-query-params"

const EditAttributeInput = ({attributeName, id, inputs, label, model, name}) => {
  const defaultValue = useCallback(() => model[attributeName]())
  const [value, setValue] = useState(() => defaultValue())

  useEffect(() => {
    inputs[name] = defaultValue()
  }, [])

  const onChangeText = useCallback((newValue) => {
    inputs[name] = newValue
    setValue(newValue)
  }, [])

  return (
    <View style={{marginBottom: 12}}>
      <Text>{label}</Text>
      <View>
        <TextInput
          dataSet={{
            attribute: attributeName,
            id,
            name
          }}
          onChangeText={onChangeText}
          style={{paddingTop: 9, paddingRight: 13, paddingBottom: 9, paddingLeft: 13, borderRadius: 5, backgroundColor: "#fff", border: "1px solid #cecece"}}
          value={value}
        />
      </View>
    </View>
  )
}

const EditAttribute = ({attribute, inputs, model, modelClass}) => {
  const availableLocales = Locales.availableLocales()
  const camelizedLower = digg(modelClass.modelClassData(), "camelizedLower")
  const contentArgs = () => ({inputProps: {attribute: attribute.attribute, model}})

  return (
    <>
      {attribute.content && attribute.content(contentArgs())}
      {!attribute.content && attribute.translated && availableLocales.map((locale) =>
        <EditAttributeInput
          attributeName={`${attribute.attribute}${inflection.camelize(locale)}`}
          id={`${camelizedLower}_${inflection.underscore(attribute.attribute)}_${locale}`}
          inputs={inputs}
          label={`${modelClass.humanAttributeName(attribute.attribute)} (${locale})`}
          model={model}
          name={`${inflection.underscore(attribute.attribute)}_${locale}`}
          key={locale}
        />
      )}
      {!attribute.content && !attribute.translated &&
        <EditAttributeInput
          attributeName={attribute.attribute}
          id={`${camelizedLower}_${inflection.underscore(attribute.attribute)}`}
          inputs={inputs}
          label={modelClass.humanAttributeName(attribute.attribute)}
          model={model}
          name={inflection.underscore(attribute.attribute)}
        />
      }
    </>
  )
}

const EditPage = ({modelClass}) => {
  const availableLocales = Locales.availableLocales()
  const currentUser = useCurrentUser()
  const queryParams = useQueryParams()
  const configReader = ConfigReader.forModel(modelClass)
  const inputs = useMemo(() => ({}))
  const modelClassName = modelClass.modelClassData().name
  const modelIdVarName = `${inflection.camelize(modelClass.modelClassData().name, true)}Id`
  const modelVarName = inflection.camelize(modelClass.modelClassData().name, true)
  const extraContent = configReader.modelConfig?.edit?.extraContentconst
  const attributes = configReader.modelConfig?.edit?.attributes
  const selectedModelAttributes = ["id"]
  const selectedAttributes = {}

  selectedAttributes[modelClassName] = selectedModelAttributes

  for (const attribute of attributes) {
    if (attribute.translated) {
      for (const locale of availableLocales) {
        selectedModelAttributes.push(`${attribute.attribute}${inflection.camelize(locale)}`)
      }
    } else {
      selectedModelAttributes.push(attribute.attribute)
    }
  }

  const useModelResult = useModel(modelClass, {
    cacheArgs: [currentUser?.id()],
    loadByQueryParam: (props) => props.queryParams.model_id,
    newIfNoId: true,
    select: selectedAttributes
  })

  const model = digg(useModelResult, modelVarName)
  const modelId = queryParams.model_id
  const modelArgs = {}

  modelArgs[modelIdVarName] = modelId

  const onSubmit = useCallback(async () => {
    try {
      model.assignAttributes(inputs)

      await model.save(inputs)
      Params.changeParams({mode: undefined, model_id: model.id()})
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }, [model])

  return (
    <View dataSet={{class: "super-admin--edit-page"}}>
      {model && attributes?.map((attribute) =>
        <EditAttribute attribute={attribute} inputs={inputs} key={attribute.attribute} model={model} modelClass={modelClass} />
      )}
      {extraContent && extraContent(modelArgs)}
      <Button onPress={onSubmit} style={{marginTop: "10px"}} title="Submit" />
    </View>
  )
}

export default memo(EditPage)
