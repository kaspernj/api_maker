import ConfigReader from "./config-reader"
import {memo} from "react"
import useCurrentUser from "../use-current-user"
import useModel from "../use-model"
import useQueryParams from "on-location-changed/src/use-query-params"

const EditPage = ({modelClass, ...restProps}) => {
  const currentUser = useCurrentUser()
  const queryParams = useQueryParams()
  const configReader = ConfigReader.forModel(modelClass)
  const camelizedLower = digg(modelClass.modelClassData(), "camelizedLower")
  const modelIdVarName = `${inflection.camelize(modelClass.modelClassData().name, true)}Id`
  const modelVarName = inflection.camelize(modelClass.modelClassData().name, true)
  const extraContent = configReader.modelConfig?.edit?.extraContentconst
  const modelArgs = {}

  const useModelResult = useModel(modelClass, {
    cacheArgs: [currentUser?.id()],
    loadByQueryParam: (props) => props.queryParams.model_id,
    newIfNoId: true
  })

  const model = digg(useModelResult, modelVarName)
  const modelId = queryParams.model_id

  console.log({useModelResult, model, modelId})

  modelArgs[modelIdVarName] = modelId

  const onSubmit = useCallback((e) => {
    e.preventDefault()

    console.log("onSubmit")
  }, [])

  return (
    <>
      <form onSubmit={onSubmit}>
        {extraContent && extraContent(modelArgs)}
        <button type="submit">
          Submit
        </button>
      </form>
    </>
  )
}

export default memo(EditPage)
