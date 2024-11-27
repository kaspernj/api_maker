import memo from "set-state-compare/src/memo"
import useModel from "./use-model.mjs"

export default (WrappedComponent, modelClass, givenArgs) => {
  const ApiMakerWithModel = (props) => {
    const args = Object.assign({match: props.match}, givenArgs)
    const useModelResult = useModel(modelClass, args)

    return (
      <WrappedComponent {...useModelResult} {...props} />
    )
  }

  return memo(ApiMakerWithModel)
}
