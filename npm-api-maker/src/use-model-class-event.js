/* eslint-disable sort-imports */
import debounceFunction from "debounce"
import ModelEvents from "./model-events.js"
import {useCallback, useLayoutEffect} from "react"
import useShape from "set-state-compare/build/use-shape.js"

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
  const {active = true, debounce, onConnected, ...restProps} = args
  const s = useShape({active, debounce, event, modelClass, onCallback})

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to apiMakerUseModelClassEvent: ${Object.keys(restProps).join(", ")}`)
  }

  const eventDebounce = useCallback(() => {
    if (!s.meta.debounceInstance) {
      if (typeof s.props.debounce == "number") {
        s.meta.debounceInstance = debounceFunction(s.p.onCallback, s.p.debounce)
      } else {
        s.meta.debounceInstance = debounceFunction(s.p.onCallback)
      }
    }

    return s.meta.debounceInstance
  }, [])

  const onModelClassEventCallback = useCallback((...callbackArgs) => {
    if (!s.p.active) {
      return
    }

    if (s.p.debounce) {
      eventDebounce()(...callbackArgs)
    } else {
      s.p.onCallback(...callbackArgs)
    }
  }, [])

  useLayoutEffect(() => {
    const modelClassConnection = ModelEvents.connectModelClass(
      s.p.modelClass,
      s.p.event,
      (...callbackArgs) => onModelClassEventCallback(...callbackArgs)
    )

    if (onConnected) {
      modelClassConnection.events.addListener("connected", onConnected)
    }

    return () => {
      if (onConnected) {
        modelClassConnection.events.removeListener("connected", onConnected)
      }

      modelClassConnection.unsubscribe()
    }
  }, [])
}

export default apiMakerUseModelClassEvent
