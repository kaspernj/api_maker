import {digg} from "diggerize"
import * as inflection from "inflection"
import memo from "set-state-compare/build/memo.js"
import React from "react"
import useCollection from "./use-collection.js"

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
