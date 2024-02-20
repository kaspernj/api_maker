import ConfigReader from "./config-reader"
import {digg} from "diggerize"
import Input from "../bootstrap/input"
import Locales from "shared/locales"
import {useCallback, memo} from "react"
import useCurrentUser from "../use-current-user"
import useModel from "../use-model"
import useQueryParams from "on-location-changed/src/use-query-params"

const EditPage = ({modelClass, ...restProps}) => {
  const availableLocales = Locales.availableLocales()
  const currentUser = useCurrentUser()
  const queryParams = useQueryParams()
  const configReader = ConfigReader.forModel(modelClass)
  const camelizedLower = digg(modelClass.modelClassData(), "camelizedLower")
  const modelClassName = modelClass.modelClassData().name
  const modelIdVarName = `${inflection.camelize(modelClass.modelClassData().name, true)}Id`
  const modelVarName = inflection.camelize(modelClass.modelClassData().name, true)
  const extraContent = configReader.modelConfig?.edit?.extraContentconst
  const attributes = configReader.modelConfig?.edit?.attributes
  const selectedModelAttributes = []
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
    newIfNoId: true
  })

  const model = digg(useModelResult, modelVarName)
  const modelId = queryParams.model_id
  const modelArgs = {}

  modelArgs[modelIdVarName] = modelId

  const onSubmit = useCallback(async (e) => {
    e.preventDefault()

    const form = digg(e, "target")
    const formData = new FormData(form)

    try {
      await model.saveRaw(formData)
      Params.changeParams({mode: undefined, model_id: model.id()})
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }, [model])

  return (
    <div className="super-admin--edit-page">
      <form onSubmit={onSubmit}>
        {model && attributes?.map((attribute) =>
          <div key={attribute.attribute}>
            {attribute.translated && availableLocales.map((locale) =>
              <div key={locale}>
                <Input
                  attribute={attribute.attribute}
                  id={`${camelizedLower}_${inflection.underscore(attribute.attribute)}_${locale}`}
                  label={`${modelClass.humanAttributeName(attribute.attribute)} (${locale})`}
                  model={model}
                  name={`${camelizedLower}[${inflection.underscore(attribute.attribute)}_${locale}]`}
                />
              </div>
            )}
            {!attribute.translated &&
              <Input
                attribute={attribute.attribute}
                id={`${camelizedLower}_${inflection.underscore(attribute.attribute)}`}
                label={modelClass.humanAttributeName(attribute.attribute)}
                model={model}
                name={`${camelizedLower}[${inflection.underscore(attribute.attribute)}]`}
              />
            }
          </div>
        )}
        {extraContent && extraContent(modelArgs)}
        <button style={{marginTop: "10px"}} type="submit">
          Submit
        </button>
      </form>
    </div>
  )
}

export default memo(EditPage)
