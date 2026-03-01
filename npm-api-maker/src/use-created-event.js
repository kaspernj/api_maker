import {ShapeHook, useShapeHook} from "set-state-compare"
import {useEffect} from "react"
import ModelEvents from "./model-events.js" // eslint-disable-line sort-imports
import PropTypes from "prop-types"
import debounceFunction from "debounce"
import propTypesExact from "prop-types-exact"

/** Hook state container for created-event subscriptions. */
class UseCreatedEventShapeHook extends ShapeHook {
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
    modelClass: PropTypes.func.isRequired,
    onConnected: PropTypes.func,
    onCreated: PropTypes.func.isRequired
  })

  /** @returns {Function} */
  debouncedOnCreated() {
    return this.cache(
      "debouncedOnCreated",
      () => {
        if (typeof this.p.debounce == "number") {
          return debounceFunction(this.p.onCreated, this.p.debounce)
        }

        return debounceFunction(this.p.onCreated)
      },
      [this.p.debounce, this.p.onCreated]
    )
  }

  /** @param {any[]} callbackArgs */
  onCreatedCallback(...callbackArgs) {
    if (!this.p.active) {
      return
    }

    if (this.p.debounce) {
      this.debouncedOnCreated()(...callbackArgs)
    } else {
      this.p.onCreated(...callbackArgs)
    }
  }

  /** @returns {void} */
  setup() {
    useEffect(() => {
      const modelClassConnection = ModelEvents.connectModelClass(
        this.p.modelClass,
        "creates",
        (...callbackArgs) => this.onCreatedCallback(...callbackArgs)
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
 * @param {Function} onCreated
 * @param {object} [args]
 * @param {boolean} [args.active]
 * @param {number} [args.debounce]
 * @param {Function} [args.onConnected]
 * @returns {void}
 */
const ApiMakerUseCreatedEvent = (
  modelClass,
  onCreated,
  args = {active: true, debounce: 0, onConnected: undefined}
) => {
  const {active = true, debounce = 0, onConnected, ...restProps} = args

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to ApiMakerUseCreatedEvent: ${Object.keys(restProps).join(", ")}`)
  }

  useShapeHook(UseCreatedEventShapeHook, {active, debounce, modelClass, onConnected, onCreated})
}

export default ApiMakerUseCreatedEvent
