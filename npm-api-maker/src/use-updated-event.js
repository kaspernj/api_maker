import {useCallback, useLayoutEffect, useMemo} from "react"
import debounceFunction from "debounce"
import ModelEvents from "./model-events.js"
import useShape from "set-state-compare/build/use-shape.js"

/**
 * @param {(import("./base-model.js").default & {id(): any})|undefined} model
 * @param {function} onUpdated
 * @param {object} [props]
 * @param {boolean} [props.active]
 * @param {number} [props.debounce]
 * @param {function} [props.onConnected]
 * @return {void}
 */
const apiMakerUseUpdatedEvent = (model, onUpdated, props = {}) => {
  const {active = true, debounce, onConnected, ...restProps} = props

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to useUpdatedEvent: ${Object.keys(restProps).join(", ")}`)
  }

  const s = useShape({active, debounce, model, onUpdated})

  const debounceCallback = useMemo(() => {
    if (typeof debounce == "number") {
      return debounceFunction(s.p.onUpdated, debounce)
    } else {
      return debounceFunction(s.p.onUpdated)
    }
  }, [debounce])

  s.updateMeta({debounceCallback})

  const onUpdatedCallback = useCallback((...args) => {
    if (!s.p.active) {
      return
    }

    if (s.p.debounce) {
      s.m.debounceCallback(...args)
    } else {
      s.p.onUpdated(...args)
    }
  }, [])

  useLayoutEffect(() => {
    let connectUpdated, onConnectedListener

    if (model) {
      connectUpdated = ModelEvents.connectUpdated(model, onUpdatedCallback)

      if (onConnected) {
        onConnectedListener = connectUpdated.events.addListener("connected", onConnected)
      }
    }

    return () => {
      if (onConnectedListener) {
        connectUpdated.events.removeListener("connected", onConnected)
      }

      if (connectUpdated) {
        connectUpdated.unsubscribe()
      }
    }
  }, [model?.id()])
}

export default apiMakerUseUpdatedEvent
