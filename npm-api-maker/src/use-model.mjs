import ModelEvents from "./model-events.mjs"
import useQueryParams from "on-location-changed/src/use-query-params.js"

const useModel = (match, modelClassArg, argsArg = {}) => {
  const queryParams = useQueryParams()
  let args, modelClass

  if (typeof argsArg == "function") {
    args = argsArg({modelClass})
  } else {
    args = argsArg
  }

  if (typeof modelClassArg == "object") {
    modelClass = modelClassArg.callback({queryParams})
  } else {
    modelClass = modelClassArg
  }

  const paramsVariableName = `${modelClass.modelName().paramKey()}_id`

  const getModelId = () => {
    if (args.loadByQueryParam) {
      return args.loadByQueryParam({queryParams})
    }

    return match.params[paramsVariableName] || match.params.id
  }

  const modelId = getModelId()
  const modelVariableName = inflection.camelize(modelClass.modelClassData().name, true)
  const cacheArgs = [modelId]
  const [model, setModel] = useState(undefined)
  const [notFound, setNotFound] = useState(undefined)

  if (args.cacheArgs) {
    cacheArgs.push(...args.cacheArgs)
  }

  const loadExistingModel = async () => {
    const query = await modelClass.ransack({id_eq: modelId})

    if (!modelId) throw new Error(`No model ID was given: ${modelId} by '${paramsVariableName}' in query params: ${Object.keys(match.params).join(", ")}`)
    if (args.abilities) query.abilities(args.abilities)
    if (args.preload) query.preload(args.preload)
    if (args.select) query.select(args.select)

    const model = await query.first()

    setModel(model)
    setNotFound(!model)
  }

  const loadNewModel = async () => {
    const params = Params.parse()
    const ModelClass = digg(this, "modelClass")
    const paramKey = ModelClass.modelName().paramKey()
    const modelDataFromParams = params[paramKey] || {}

    let defaults = {}

    if (this.args.newIfNoId?.defaults) {
      defaults = await this.args.newIfNoId.defaults()
    }

    const modelData = Object.assign(defaults, this.args.newAttributes, modelDataFromParams)
    const model = new ModelClass({
      isNewRecord: true,
      data: {a: modelData}
    })

    setModel(model)
  }

  const loadModel = async () => {
    if (args.newIfNoId && !modelId) {
      return await loadNewModel()
    } else if (!args.optional || modelId) {
      return await loadExistingModel()
    }
  }

  useEffect(
    () => { loadModel() },
    cacheArgs
  )

  useEffect(() => {
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

  useEffect(() => {
    let connectUpdated

    if (model && args.eventUpdated) {
      connectUpdated = ModelEvents.connectUpdated(model, loadModel)
    }

    return () => {
      connectUpdated?.unsubscribe()
    }
  }, [args.eventUpdated, model?.id()])

  useEffect(() => {
    let connectDestroyed

    if (model && args.onDestroyed) {
      connectDestroyed = ModelEvents.connectDestroyed(model, loadModel)
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
