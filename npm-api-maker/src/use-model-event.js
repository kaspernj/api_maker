import {useCallback, useLayoutEffect, useMemo} from "react"
import debounceFunction from "debounce"
import ModelEvents from "./model-events.js"
import useShape from "set-state-compare/build/use-shape.js"

/**
 * @param {(import("./base-model.js").default & {id(): any})|undefined} model
 * @param {string} event
 * @param {function} onCallback
 * @param {object} [props]
 * @param {boolean} [props.active]
 * @param {number} [props.debounce]
 * @param {function} [props.onConnected]
 * @return {void}
 */
const apiMakerUseModelEvent = (model, event, onCallback, props) => {
  const {active = true, debounce, onConnected, ...restProps} = props || {}

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to apiMakerUseModelEvent: ${Object.keys(restProps).join(", ")}`)
  }

  const s = useShape({active, debounce, model, onCallback})

  const debounceCallback = useMemo(() => {
    if (typeof debounce == "number") {
      return debounceFunction(s.p.onCallback, debounce)
    } else {
      return debounceFunction(s.p.onCallback)
    }
  }, [debounce])

  s.updateMeta({debounceCallback})

  const onCallbackCallback = useCallback((...args) => {
    if (!s.p.active) {
      return
    }

    if (s.p.debounce) {
      s.m.debounceCallback(...args)
    } else {
      s.p.onCallback(...args)
    }
  }, [])

  useLayoutEffect(() => {
    let connectEvent, onConnectedListener

    if (model) {
      connectEvent = ModelEvents.connect(model, event, onCallbackCallback)

      if (onConnected) {
        onConnectedListener = connectEvent.events.addListener("connected", onConnected)
      }
    }

    return () => {
      if (onConnectedListener) {
        connectEvent.events.removeListener("connected", onConnected)
      }

      if (connectEvent) {
        connectEvent.unsubscribe()
      }
    }
  }, [model?.id()])
}

export default apiMakerUseModelEvent
