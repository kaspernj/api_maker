// @ts-check
import {ShapeHook, useShapeHook} from "set-state-compare"
import {useEffect} from "react"
import ModelEvents from "./model-events.js" // eslint-disable-line sort-imports
import PropTypes from "prop-types"
import debounceFunction from "debounce"
import propTypesExact from "prop-types-exact"

/** @typedef {import("./base-model.js").default} BaseModel */
/** @typedef {string | number | boolean | null} EventArgumentPrimitive */
/** @typedef {EventArgumentPrimitive | EventArgumentPrimitive[]} EventArgumentValue */
/** @typedef {{args: Record<string, EventArgumentValue>, eventName: string}} ModelClassEventPayload */
/** @typedef {{model: BaseModel}} CreatedEventPayload */
/** @typedef {CreatedEventPayload | ModelClassEventPayload} ModelClassSubscriptionPayload */
/** @typedef {{active?: boolean, debounce?: boolean|number, onConnected?: () => void}} UseModelClassEventArgs */
/** @typedef {typeof import("./base-model.js").default} ModelClassType */
/** @typedef {(payload: ModelClassSubscriptionPayload) => void} EventCallback */

/** Hook state container for model-class event subscriptions. */
class UseModelClassEventShapeHook extends ShapeHook {
  static defaultProps = {
    active: true,
    debounce: 0,
    onConnected: undefined
  }

  static propTypes = propTypesExact({
    active: PropTypes.bool,
    debounce: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number
    ]),
    event: PropTypes.string.isRequired,
    modelClass: PropTypes.func.isRequired,
    onCallback: PropTypes.func.isRequired,
    onConnected: PropTypes.func
  })

  /** @returns {Function} */
  debouncedOnCallback() {
    return this.cache(
      "debouncedOnCallback",
      () => {
        if (typeof this.p.debounce == "number") {
          return debounceFunction(this.p.onCallback, this.p.debounce)
        }

        return debounceFunction(this.p.onCallback)
      },
      [this.p.debounce, this.p.onCallback]
    )
  }

  /**
   * Forwards a model-class subscription payload to the caller.
   * @param {ModelClassSubscriptionPayload} payload
   * @returns {void}
   */
  onModelClassEventCallback(payload) {
    if (!this.p.active) {
      return
    }

    if (this.p.debounce) {
      this.debouncedOnCallback()(payload)
    } else {
      this.p.onCallback(payload)
    }
  }

  /** @returns {void} */
  setup() {
    useEffect(() => {
      const callback = (payload) => this.onModelClassEventCallback(payload)
      const modelClassConnection = this.p.event == "creates"
        ? ModelEvents.connectCreated(this.p.modelClass, callback)
        : ModelEvents.connectModelClass(this.p.modelClass, this.p.event, callback)

      if (this.p.onConnected) {
        modelClassConnection.events.addListener("connected", this.p.onConnected)
      }

      return () => {
        if (this.p.onConnected) {
          modelClassConnection.events.removeListener("connected", this.p.onConnected)
        }

        modelClassConnection.unsubscribe()
      }
    }, [])
  }
}

/**
 * @param {ModelClassType} modelClass
 * @param {string} event
 * @param {EventCallback} onCallback
 * @param {UseModelClassEventArgs} [args]
 * @returns {void}
 */
// eslint-disable-next-line max-params
const apiMakerUseModelClassEvent = (modelClass, event, onCallback, args = {}) => {
  const {active = true, debounce = 0, onConnected, ...restProps} = args

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to apiMakerUseModelClassEvent: ${Object.keys(restProps).join(", ")}`)
  }

  useShapeHook(UseModelClassEventShapeHook, {active, debounce, event, modelClass, onCallback, onConnected})
}

export default apiMakerUseModelClassEvent
