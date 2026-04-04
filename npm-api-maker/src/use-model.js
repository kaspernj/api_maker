/* eslint-disable sort-imports */
import {ShapeHook, useShapeHook} from "set-state-compare"
import {useEffect} from "react"
import Devise from "./devise.js"
import * as inflection from "inflection"
import ModelEvents from "./model-events.js"
import useQueryParams from "on-location-changed/build/use-query-params.js"
import useUpdatedEvent from "./use-updated-event.js"

/**
 * @typedef {object} useModelArgs
 * @property {(arg: object) => Function} [callback]
 * @property {(arg: object) => object} [args]
 * @property {(args: {queryParams: Record<string, any> | undefined}) => number|string} [loadByQueryParam]
 * @property {any[]} [cacheArgs]
 * @property {{params: object}} [match]
 * @property {(ctx: { model: import("./base-model.js").default }) => void} [onDestroyed]
 * @property {import("./collection.js").default} [query]
 */

/** Hook state container for useModel. */
class UseModelShapeHook extends ShapeHook {
  /** Constructor. */
  constructor(props) {
    super(props)
    this.loadModelGeneration = 0
    this.newIfNoIdDefaultsResult = null
    this.queryParams = undefined
  }

  /** @returns {boolean} */
  active() {
    return !("active" in this.args()) || Boolean(this.args().active)
  }

  /** @returns {useModelArgs & Record<string, any>} */
  args() {
    if (typeof this.p.argsArg == "function") {
      return this.p.argsArg({modelClass: this.modelClass()})
    }

    return this.p.argsArg || {}
  }

  /** @returns {typeof import("./base-model.js").default & Record<string, any>} */
  modelClass() {
    if (typeof this.p.modelClassArg == "object") {
      return this.p.modelClassArg.callback({queryParams: this.queryParams})
    }

    return this.p.modelClassArg
  }

  /** @returns {string} */
  paramsVariableName() {
    return `${this.modelClass().modelName()
      .paramKey()}_id`
  }

  /** @returns {number | string | undefined} */
  modelId() {
    if (this.args().loadByQueryParam) {
      return this.args().loadByQueryParam({queryParams: this.queryParams})
    } else if (this.args().query) {
      return undefined
    } else if (!this.args().match) {
      throw new Error("Both 'loadByQueryParam' and 'match' wasn't given")
    }

    return this.args().match.params[this.paramsVariableName()] || this.args().match.params.id
  }

  /** @returns {string} */
  modelVariableName() {
    return inflection.camelize(this.modelClass().modelClassData().name, true)
  }

  /** @returns {any[]} */
  cacheArgs() {
    return [this.modelId()].concat(this.args().cacheArgs || [], this.queryParams)
  }

  /** @returns {boolean} */
  shouldWaitForUpdatedConnection() {
    return Boolean(this.args().eventUpdated && this.modelId() && !this.s.model)
  }

  /** @returns {object} */
  newModelDataFromParams() {
    return this.queryParams?.[this.modelClass().modelName()
      .paramKey()] || {}
  }

  /** @returns {boolean} */
  hasAsyncDefaults() {
    return Boolean(this.newIfNoIdDefaultsResult && typeof this.newIfNoIdDefaultsResult.then == "function")
  }

  /** @returns {object | null} */
  syncDefaultsForNewModel() {
    if (!this.args().newIfNoId?.defaults) {
      return {}
    }

    if (this.newIfNoIdDefaultsResult === null) {
      const defaultsResult = this.args().newIfNoId.defaults()

      if (defaultsResult && typeof defaultsResult.then == "function") {
        this.newIfNoIdDefaultsResult = defaultsResult.catch((error) => {
          throw error
        })

        return null
      }

      this.newIfNoIdDefaultsResult = defaultsResult
    }

    return this.newIfNoIdDefaultsResult || {}
  }

  /** @returns {import("./base-model.js").default | undefined} */
  syncNewModel() {
    if (!this.active() || !this.args().newIfNoId || this.modelId()) {
      return undefined
    }

    const defaults = this.syncDefaultsForNewModel()

    if (defaults === null) {
      return undefined
    }

    return new (this.modelClass())({
      isNewRecord: true,
      data: {a: Object.assign(defaults, this.args().newAttributes, this.newModelDataFromParams())}
    })
  }

  /** @returns {import("./base-model.js").default | undefined} */
  subscriptionModel() {
    if (!this.args().eventUpdated) {
      return undefined
    } else if (this.s.model) {
      return this.s.model
    } else if (!this.modelId()) {
      return undefined
    }

    return new (this.modelClass())({
      data: {a: {[this.modelClass().primaryKey()]: this.modelId()}}
    })
  }

  /** @param {number} loadModelGeneration */
  loadExistingModel = async (loadModelGeneration) => {
    let query

    if (this.modelId()) {
      query = this.modelClass().ransack({id_eq: this.modelId()})
    } else if (this.args().query) {
      query = this.args().query.clone()
    } else {
      const matchParams = this.args().match?.params || {}

      throw new Error(`No model ID was given: ${this.modelId()} by '${this.paramsVariableName()}' in query params: ${Object.keys(matchParams).join(", ")}`)
    }

    if (this.args().abilities) query.abilities(this.args().abilities)
    if (this.args().preload) query.preload(this.args().preload)
    if (this.args().select) query.select(this.args().select)

    const model = await query.first()

    if (loadModelGeneration != this.loadModelGeneration) return

    if (
      this.s.model &&
      model &&
      !this.s.notFound &&
      this.s.model.fullCacheKey() == model.fullCacheKey()
    ) {
      return
    } else if (!this.s.model && !model && this.s.notFound) {
      return
    }

    this.setState({model, notFound: !model})
  }

  /** @param {number} loadModelGeneration */
  loadNewModel = async (loadModelGeneration) => {
    let defaults = {}

    if (this.args().newIfNoId?.defaults) {
      let defaultsResult = this.newIfNoIdDefaultsResult

      if (defaultsResult === null) {
        defaultsResult = this.args().newIfNoId.defaults()
      }

      this.newIfNoIdDefaultsResult = null
      defaults = await defaultsResult
    }

    const model = new (this.modelClass())({
      isNewRecord: true,
      data: {a: Object.assign(defaults, this.args().newAttributes, this.newModelDataFromParams())}
    })

    if (loadModelGeneration != this.loadModelGeneration) return

    this.setState({model, notFound: false})
  }

  /** @returns {Promise<void>} */
  loadModel = async () => {
    // Only the newest model request may update state after route or auth changes.
    const loadModelGeneration = this.loadModelGeneration + 1

    this.loadModelGeneration = loadModelGeneration
    if (this.active() && this.args().newIfNoId && !this.modelId()) {
      await this.loadNewModel(loadModelGeneration)
    } else if (this.active() && (!this.args().optional || this.modelId() || this.args().query)) {
      await this.loadExistingModel(loadModelGeneration)
    }
  }

  /** @param {{model: import("./base-model.js").default}} args */
  onDestroyed = (args) => {
    const forwardArgs = {model: args.model}

    forwardArgs[this.modelVariableName()] = args.model

    this.args().onDestroyed(forwardArgs)
  }

  /** @returns {void} */
  onSignedIn = () => {
    this.loadModel()
  }

  /** @returns {void} */
  onSignedOut = () => {
    this.loadModel()
  }

  /** @returns {import("./base-model.js").default | undefined} */
  visibleModel() {
    let model = this.s.model

    if (!model) {
      model = this.syncNewModel()
    }

    if (!this.active()) {
      return undefined
    } else if (this.modelId() && model && model.id() != this.modelId()) {
      return undefined
    } else if (!this.modelId() && !this.args().query && !this.args().newIfNoId) {
      return undefined
    }

    return model
  }

  /** @returns {boolean | undefined} */
  visibleNotFound() {
    if (!this.active()) {
      return undefined
    } else if (this.modelId() && this.visibleModel() === undefined) {
      return undefined
    } else if (!this.modelId() && !this.args().query && !this.args().newIfNoId) {
      return undefined
    }

    return this.s.notFound
  }

  /** @returns {void} */
  setup() {
    this.useStates({
      model: undefined,
      notFound: undefined
    })
    this.setInstance({queryParams: useQueryParams()})

    useEffect(
      () => {
        if (this.s.model === undefined) {
          const syncNewModel = this.syncNewModel()

          if (syncNewModel) {
            this.setState({model: syncNewModel, notFound: false})
          }
        }

        if (!this.shouldWaitForUpdatedConnection()) {
          this.loadModel()
        }
      },
      this.cacheArgs()
    )

    // Invalidate in-flight async responses so stale loads cannot write after unmount.
    useEffect(() => () => {
      this.loadModelGeneration += 1
    }, [])

    useEffect(() => {
      if (!this.args().events) return

      this.args().events.addListener("reloadModel", this.loadModel)

      return () => {
        this.args().events.removeListener("reloadModel", this.loadModel)
      }
    }, [this.args().events])

    useUpdatedEvent(this.subscriptionModel(), this.loadModel, {
      onConnected: this.loadModel
    })

    useEffect(() => {
      Devise.events().addListener("onDeviseSignIn", this.onSignedIn)
      Devise.events().addListener("onDeviseSignOut", this.onSignedOut)

      return () => {
        Devise.events().removeListener("onDeviseSignIn", this.onSignedIn)
        Devise.events().removeListener("onDeviseSignOut", this.onSignedOut)
      }
    })

    useEffect(() => {
      if (!this.s.model || !this.args().onDestroyed) return

      const connectDestroyed = ModelEvents.connectDestroyed(this.s.model, this.onDestroyed)

      return () => {
        connectDestroyed.unsubscribe()
      }
    }, [this.args().onDestroyed, this.s.model ? this.s.model.id() : undefined])
  }
}

/**
 * @param {Function|object} modelClassArg
 * @param {object | ((args: {modelClass: typeof import("./base-model.js").default}) => useModelArgs)} [argsArg]
 * @returns {Record<string, any>}
 */
/** useModel. */
const useModel = (modelClassArg, argsArg = {}) => {
  const shapeHook = useShapeHook(UseModelShapeHook, {argsArg, modelClassArg})
  const model = shapeHook.visibleModel()
  const modelId = shapeHook.modelId()
  const notFound = shapeHook.visibleNotFound()
  const modelVariableName = shapeHook.modelVariableName()
  const result = {
    model,
    modelId,
    notFound
  }

  result[modelVariableName] = model
  result[`${modelVariableName}Id`] = modelId
  result[`${modelVariableName}NotFound`] = notFound

  return result
}

export default useModel
