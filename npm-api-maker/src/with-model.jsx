import memo from ""set-state-compare/build/memo.js"
import React from "react"
import useModel from "./use-model.js"

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
