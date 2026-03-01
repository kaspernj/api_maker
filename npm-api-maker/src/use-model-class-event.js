import {ShapeHook, useShapeHook} from "set-state-compare"
import {useEffect} from "react"
import ModelEvents from "./model-events.js" // eslint-disable-line sort-imports
import PropTypes from "prop-types"
import debounceFunction from "debounce"
import propTypesExact from "prop-types-exact"

/** Hook state container for model-class event subscriptions. */
class UseModelClassEventShapeHook extends ShapeHook {
  static defaultProps = {
    active: true,
    debounce: 0,
    onConnected: undefined
  }

  static propTypes = propTypesExact({
    active: PropTypes.bool.isRequired,
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

  /** @param {any[]} callbackArgs */
  onModelClassEventCallback(...callbackArgs) {
    if (!this.p.active) {
      return
    }

    if (this.p.debounce) {
      this.debouncedOnCallback()(...callbackArgs)
    } else {
      this.p.onCallback(...callbackArgs)
    }
  }

  /** @returns {void} */
  setup() {
    useEffect(() => {
      const modelClassConnection = ModelEvents.connectModelClass(
        this.p.modelClass,
        this.p.event,
        (...callbackArgs) => this.onModelClassEventCallback(...callbackArgs)
      )

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
 * @param {Function} modelClass
 * @param {string} event
 * @param {Function} onCallback
 * @param {object} [args]
 * @param {boolean} [args.active]
 * @param {number} [args.debounce]
 * @param {Function} [args.onConnected]
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
