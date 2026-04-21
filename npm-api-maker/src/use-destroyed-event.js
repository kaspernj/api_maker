// @ts-check
import {ShapeHook, useShapeHook} from "set-state-compare"
import {useLayoutEffect} from "react"
import ModelEvents from "./model-events.js" // eslint-disable-line sort-imports
import PropTypes from "prop-types"
import debounceFunction from "debounce"
import propTypesExact from "prop-types-exact"

/** @typedef {{active?: boolean, debounce?: boolean|number, onConnected?: () => void}} UseDestroyedEventProps */
/** @typedef {import("./base-model.js").default} EventModel */
/** @typedef {EventModel & {id: () => number|string}} EventModelWithId */
/** @typedef {{model: EventModel}} DestroyedEventPayload */
/** @typedef {(payload: DestroyedEventPayload) => void} EventCallback */

/**
 * @param {EventModel | EventModel[] | undefined | null} modelOrModels
 * @returns {EventModel[]}
 */
const modelsFromInput = (modelOrModels) => {
  if (!modelOrModels) {
    return []
  } else if (Array.isArray(modelOrModels)) {
    return modelOrModels.filter(Boolean)
  } else {
    return [modelOrModels]
  }
}

/**
 * @param {EventModel | EventModel[] | undefined | null} modelOrModels
 * @returns {string}
 */
const modelsDependencyKey = (modelOrModels) => JSON.stringify(
  modelsFromInput(modelOrModels).map((model) => /** @type {EventModelWithId} */ (model).id())
)

/**
 * @param {EventModel | EventModel[] | undefined | null} modelOrModels
 * @returns {Record<string, EventModelWithId>}
 */
const modelsByIdFromInput = (modelOrModels) => {
  const modelsById = /** @type {Record<string, EventModelWithId>} */ ({})

  modelsFromInput(modelOrModels).forEach((model) => {
    const modelWithId = /** @type {EventModelWithId} */ (model)

    modelsById[modelWithId.id()] = modelWithId
  })

  return modelsById
}

/** Hook state container for destroyed-model event subscriptions. */
class UseDestroyedEventShapeHook extends ShapeHook {
  static defaultProps = {
    active: true,
    debounce: undefined,
    model: undefined,
    onConnected: undefined
  }

  static propTypes = propTypesExact({
    active: PropTypes.bool,
    debounce: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number
    ]),
    model: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.arrayOf(PropTypes.object)
    ]),
    onConnected: PropTypes.func,
    onDestroyed: PropTypes.func.isRequired
  })

  /** @returns {void} */
  setup() {
    useLayoutEffect(() => {
      const currentConnections = this.currentConnections()
      const nextModelsById = modelsByIdFromInput(this.p.model)
      const callback = (payload) => this.onDestroyedCallback(payload)

      Object.keys(currentConnections).forEach((modelId) => {
        if (!(modelId in nextModelsById)) {
          if (this.p.onConnected) {
            currentConnections[modelId].events.removeListener("connected", this.p.onConnected)
          }

          currentConnections[modelId].unsubscribe()
          delete currentConnections[modelId]
        }
      })

      Object.keys(nextModelsById).forEach((modelId) => {
        if (modelId in currentConnections) {
          return
        }

        const destroyedConnection = ModelEvents.connectDestroyed(nextModelsById[modelId], callback)
        currentConnections[modelId] = destroyedConnection

        if (this.p.onConnected) {
          destroyedConnection.events.addListener("connected", this.p.onConnected)
        }
      })
    }, [modelsDependencyKey(this.p.model)])

    useLayoutEffect(() => () => {
      const currentConnections = this.currentConnections()

      Object.values(currentConnections).forEach((destroyedConnection) => {
        if (this.p.onConnected) {
          destroyedConnection.events.removeListener("connected", this.p.onConnected)
        }

        destroyedConnection.unsubscribe()
      })

      this.currentConnectionsValue = {}
    }, [])
  }

  /** @returns {Record<string, import("./cable-subscription.js").default>} */
  currentConnections() {
    this.currentConnectionsValue ||= {}

    return this.currentConnectionsValue
  }

  /** @returns {Function} */
  debouncedOnDestroyed() {
    return this.cache(
      "debouncedOnDestroyed",
      () => {
        if (typeof this.p.debounce == "number") {
          return debounceFunction(this.p.onDestroyed, this.p.debounce)
        }

        return debounceFunction(this.p.onDestroyed)
      },
      [this.p.debounce, this.p.onDestroyed]
    )
  }

  /**
   * Forwards a destroyed-model payload to the caller.
   * @param {DestroyedEventPayload} payload
   * @returns {void}
   */
  onDestroyedCallback(payload) {
    if (!this.p.active) {
      return
    }

    if (this.p.debounce) {
      this.debouncedOnDestroyed()(payload)
    } else {
      this.p.onDestroyed(payload)
    }
  }
}

/**
 * @param {EventModel | EventModel[]} model
 * @param {EventCallback} onDestroyed
 * @param {UseDestroyedEventProps} [props]
 * @returns {void}
 */
const apiMakerUseDestroyedEvent = (model, onDestroyed, props = {}) => {
  const {active = true, debounce, onConnected, ...restProps} = props

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to useDestroyedEvent: ${Object.keys(restProps).join(", ")}`)
  }

  useShapeHook(UseDestroyedEventShapeHook, {active, debounce, model, onConnected, onDestroyed})
}

export default apiMakerUseDestroyedEvent
