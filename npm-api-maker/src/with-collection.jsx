import {digg} from "diggerize"
import memo from "set-state-compare/src/memo"
import useCollection from "./use-collection"

export default (WrappedComponent, withCollectionArgs) => memo(() => {
  const useCollectionResult = useCollection(withCollectionArgs)
  const models = digg(useCollectionResult, "models")
  const modelsArgName = inflection.camelize(digg(withCollectionArgs.modelClass.modelClassData(), "pluralName"), true)
  const forwardArgs = {}

  forwardArgs[modelsArgName] = models

  return (
    <WrappedComponent {...forwardArgs} {...this.props} />
  )
})
