import {useCallback, useLayoutEffect, useMemo} from "react"
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

  s.useStates({
    model: undefined,
    notFound: undefined
  })

  if ("active" in s.props && !s.props.active) {
    s.meta.active = false
  } else {
    s.meta.active = true
  }

  if (typeof modelClassArg == "object") {
    modelClass = modelClassArg.callback({queryParams})
  } else {
    modelClass = modelClassArg
  }

  const paramsVariableName = `${modelClass.modelName().paramKey()}_id`
  let modelId

  if (args.loadByQueryParam) {
    modelId = args.loadByQueryParam({queryParams})
  } else if (!args.query) {
    if (!args.match) throw new Error("Both 'loadByQueryParam' and 'match' wasn't given")

    modelId = args.match.params[paramsVariableName] || args.match.params.id
  }

  const modelVariableName = inflection.camelize(modelClass.modelClassData().name, true)
  const cacheArgs = [modelId]

  const loadExistingModel = useCallback(async () => {
    let query

    if (s.m.modelId) {
      query = modelClass.ransack({id_eq: s.m.modelId})
    } else if (s.m.args.query) {
      query = s.m.args.query.clone()
    } else {
      throw new Error(`No model ID was given: ${s.m.modelId} by '${paramsVariableName}' in query params: ${Object.keys(s.props.match.params).join(", ")}`)
    }

    if (s.props.abilities) query.abilities(s.p.abilities)
    if (s.props.preload) query.preload(s.p.preload)
    if (s.props.select) query.select(s.p.select)

    const model = await query.first()

    s.set({model, notFound: !model})
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

    s.set({model})
  }, [])

  const loadModel = useCallback(async () => {
    if (!s.m.active) {
      // Not active - don't do anything
    } else if (s.props.newIfNoId && !s.m.modelId) {
      return await loadNewModel()
    } else if (!s.props.optional || s.m.modelId | s.m.args.query) {
      return await loadExistingModel()
    }
  }, [])

  const onDestroyed = useCallback(({model}) => {
    const forwardArgs = {model}

    forwardArgs[s.m.modelVariableName] = model

    s.p.onDestroyed(forwardArgs)
  }, [])

  const onSignedIn = useCallback(() => {
    loadModel()
  }, [])

  const onSignedOut = useCallback(() => {
    loadModel()
  }, [])

  if (args.cacheArgs) {
    cacheArgs.push(...args.cacheArgs)
  }

  s.updateMeta({args, modelId, modelVariableName, queryParams})

  useMemo(
    () => { loadModel() },
    cacheArgs
  )

  useLayoutEffect(() => {
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

  useLayoutEffect(() => {
    let connectUpdated

    if (s.s.model && args.eventUpdated) {
      connectUpdated = ModelEvents.connectUpdated(s.s.model, loadModel)
    }

    return () => {
      connectUpdated?.unsubscribe()
    }
  }, [args.eventUpdated, s.s.model?.id()])

  useLayoutEffect(() => {
    Devise.events().addListener("onDeviseSignIn", onSignedIn)
    Devise.events().addListener("onDeviseSignOut", onSignedOut)

    return () => {
      Devise.events().removeListener("onDeviseSignIn", onSignedIn)
      Devise.events().removeListener("onDeviseSignOut", onSignedOut)
    }
  })

  useLayoutEffect(() => {
    let connectDestroyed

    if (s.s.model && args.onDestroyed) {
      connectDestroyed = ModelEvents.connectDestroyed(s.s.model, onDestroyed)
    }

    return () => {
      connectDestroyed?.unsubscribe()
    }
  }, [args.onDestroyed, s.s.model?.id()])

  const result = {
    model: s.s.model,
    modelId,
    notFound: s.s.notFound
  }

  result[modelVariableName] = s.s.model
  result[`${modelVariableName}Id`] = modelId
  result[`${modelVariableName}NotFound`] = s.s.notFound

  return result
}

export default useModel
