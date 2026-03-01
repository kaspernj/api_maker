import {ShapeHook, useShapeHook} from "set-state-compare"
import {useLayoutEffect} from "react"
import ModelEvents from "./model-events.js" // eslint-disable-line sort-imports
import PropTypes from "prop-types"
import debounceFunction from "debounce"
import propTypesExact from "prop-types-exact"

/**
 * @param {object|object[]|undefined|null} modelOrModels
 * @returns {object[]}
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
 * @param {object|object[]|undefined|null} modelOrModels
 * @returns {string}
 */
const modelsDependencyKey = (modelOrModels) => JSON.stringify(modelsFromInput(modelOrModels).map((model) => model.id()))

/**
 * @param {object|object[]|undefined|null} modelOrModels
 * @returns {Record<string, object>}
 */
const modelsByIdFromInput = (modelOrModels) => {
  const modelsById = {}

  modelsFromInput(modelOrModels).forEach((model) => {
    modelsById[model.id()] = model
  })

  return modelsById
}

/** Hook state container for destroyed-model event subscriptions. */
class UseDestroyedEventShapeHook extends ShapeHook {
  static defaultProps = {
    active: true,
    debounce: undefined,
    onConnected: undefined
  }

  static propTypes = propTypesExact({
    active: PropTypes.bool.isRequired,
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

  /** @param {any[]} callbackArgs */
  onDestroyedCallback(...callbackArgs) {
    if (!this.p.active) {
      return
    }

    if (this.p.debounce) {
      this.debouncedOnDestroyed()(...callbackArgs)
    } else {
      this.p.onDestroyed(...callbackArgs)
    }
  }

  /** @returns {void} */
  setup() {
    useLayoutEffect(() => {
      const currentConnections = this.currentConnections()
      const nextModelsById = modelsByIdFromInput(this.p.model)
      const callback = (...callbackArgs) => this.onDestroyedCallback(...callbackArgs)

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
}

/**
 * @param {import("./base-model.js").default|import("./base-model.js").default[]} model
 * @param {Function} onDestroyed
 * @param {object} [props]
 * @param {boolean} [props.active]
 * @param {number} [props.debounce]
 * @param {Function} [props.onConnected]
 * @returns {void}
 */
/** apiMakerUseDestroyedEvent. */
const apiMakerUseDestroyedEvent = (model, onDestroyed, props = {}) => {
  const {active = true, debounce, onConnected, ...restProps} = props

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to useDestroyedEvent: ${Object.keys(restProps).join(", ")}`)
  }

  useShapeHook(UseDestroyedEventShapeHook, {active, debounce, model, onConnected, onDestroyed})
}

export default apiMakerUseDestroyedEvent
