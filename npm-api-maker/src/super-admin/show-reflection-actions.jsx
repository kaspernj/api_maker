import {digg} from "diggerize"
import {memo} from "react"

const SuperAdminShowReflectionActions = ({model, modelClass, reflectionName}) => {
  const reflection = modelClass.reflections().find((reflection) => reflection.name() == reflectionName)
  const modelClassName = digg(reflection, "reflectionData", "className")
  const modelData = {}
  const dataParamName = inflection.singularize(reflection.reflectionData.collectionName)
  const {canCan} = useCanCan(() => [[reflection.modelClass(), ["new"]]])

  modelData[reflection.foreignKey()] = model?.id()

  const linkParams = {
    model: modelClassName,
    mode: "new"
  }

  linkParams[dataParamName] = modelData

  return (
    <>
      {canCan?.can("new", reflection.modelClass()) &&
        <Link className="create-new-model-link" to={Params.withParams(linkParams)}>
          Create new
        </Link>
      }
    </>
  )
}

export default memo(SuperAdminShowReflectionActions)
