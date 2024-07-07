import {useCallback, useMemo, useState} from "react"
import Devise from "./devise.mjs"
import * as inflection from "inflection"
import ModelEvents from "./model-events.mjs"
import useQueryParams from "on-location-changed/src/use-query-params.js"
import useShape from "set-state-compare/src/use-shape.js"

const useModel = (modelClassArg, argsArg = {}) => {
  const queryParams = useQueryParams()
  let args, modelClass

  if (typeof argsArg == "function") {
    args = argsArg({modelClass})
  } else {
    args = argsArg
  }

  const s = useShape(args)

  if (typeof modelClassArg == "object") {
    modelClass = modelClassArg.callback({queryParams})
  } else {
    modelClass = modelClassArg
  }

  const paramsVariableName = `${modelClass.modelName().paramKey()}_id`
  let modelId

  if (args.loadByQueryParam) {
    modelId = args.loadByQueryParam({queryParams})
  } else {
    if (!args.match) throw new Error("Both 'loadByQueryParam' and 'match' wasn't given")

    modelId = args.match.params[paramsVariableName] || args.match.params.id
  }

  const modelVariableName = inflection.camelize(modelClass.modelClassData().name, true)
  const cacheArgs = [modelId]
  const [model, setModel] = useState(undefined)
  const [notFound, setNotFound] = useState(undefined)

  if (args.cacheArgs) {
    cacheArgs.push(...args.cacheArgs)
  }

  s.updateMeta({modelId, modelVariableName, queryParams})

  const loadExistingModel = useCallback(async () => {
    const query = await modelClass.ransack({id_eq: s.m.modelId})

    if (!modelId) {
      throw new Error(`No model ID was given: ${s.m.modelId} by '${paramsVariableName}' in query params: ${Object.keys(s.props.match.params).join(", ")}`)
    }

    if (s.props.abilities) query.abilities(s.p.abilities)
    if (s.props.preload) query.preload(s.p.preload)
    if (s.props.select) query.select(s.p.select)

    const model = await query.first()

    setModel(model)
    setNotFound(!model)
  }, [])

  const loadNewModel = useCallback(async () => {
    const ModelClass = modelClass
    const paramKey = ModelClass.modelName().paramKey()
    const modelDataFromParams = s.m.queryParams[paramKey] || {}

    let defaults = {}

    if (s.props.newIfNoId?.defaults) {
      defaults = await s.props.newIfNoId.defaults()
    }

    const modelData = Object.assign(defaults, s.props.newAttributes, modelDataFromParams)
    const model = new ModelClass({
      isNewRecord: true,
      data: {a: modelData}
    })

    setModel(model)
  }, [])

  const loadModel = useCallback(async () => {
    if (s.props.newIfNoId && !s.m.modelId) {
      return await loadNewModel()
    } else if (!s.props.optional || s.m.modelId) {
      return await loadExistingModel()
    }
  }, [])

  useMemo(
    () => { loadModel() },
    cacheArgs
  )

  useMemo(() => {
    let reloadModelCallback

    if (args.events) {
      reloadModelCallback = args.events.addListener("reloadModel", loadModel)
    }

    return () => {
      if (reloadModelCallback) {
        args.events.removeListener("reloadModel", loadModel)
      }
    }
  }, [args.events])

  useMemo(() => {
    let connectUpdated

    if (model && args.eventUpdated) {
      connectUpdated = ModelEvents.connectUpdated(model, loadModel)
    }

    return () => {
      connectUpdated?.unsubscribe()
    }
  }, [args.eventUpdated, model?.id()])

  const onSignedIn = useCallback(() => {
    loadModel()
  }, [])

  const onSignedOut = useCallback(() => {
    loadModel()
  }, [])

  useMemo(() => {
    Devise.events().addListener("onDeviseSignIn", onSignedIn)
    Devise.events().addListener("onDeviseSignOut", onSignedOut)

    return () => {
      Devise.events().removeListener("onDeviseSignIn", onSignedIn)
      Devise.events().removeListener("onDeviseSignOut", onSignedOut)
    }
  })

  const onDestroyed = useCallback(({model}) => {
    const forwardArgs = {model}

    forwardArgs[s.m.modelVariableName] = model

    s.p.onDestroyed(forwardArgs)
  }, [])

  useMemo(() => {
    let connectDestroyed

    if (model && args.onDestroyed) {
      connectDestroyed = ModelEvents.connectDestroyed(model, onDestroyed)
    }

    return () => {
      connectDestroyed?.unsubscribe()
    }
  }, [args.onDestroyed, model?.id()])

  const result = {}

  result[modelVariableName] = model
  result[`${modelVariableName}Id`] = modelId
  result[`${modelVariableName}NotFound`] = notFound

  return result
}

export default useModel
