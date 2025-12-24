import {useCallback, useLayoutEffect, useMemo} from "react" // eslint-disable-line sort-imports
import debounceFunction from "debounce"
import ModelEvents from "./model-events.js"
import useShape from "set-state-compare/build/use-shape.js"

/**
 * @param {object} model
 * @param {function} onDestroyed
 * @param {object} props
 * @param {boolean} props.active
 * @param {number} props.debounce
 * @param {function} props.onConnected
 * @returns {void}
 */
const apiMakerUseDestroyedEvent = (model, onDestroyed, props) => { // eslint-disable-line react-hooks/rules-of-hooks
  const {active = true, debounce, onConnected, ...restProps} = props || {}

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to useDestroyedEvent: ${Object.keys(restProps).join(", ")}`)
  }

  const s = useShape({active, debounce, model, onDestroyed}) // eslint-disable-line react-hooks/rules-of-hooks

  const debounceCallback = useMemo(() => { // eslint-disable-line react-hooks/rules-of-hooks
    if (typeof debounce == "number") {
      return debounceFunction(s.p.onDestroyed, debounce)
    } else {
      return debounceFunction(s.p.onDestroyed)
    }
  }, [debounce]) // eslint-disable-line react-hooks/exhaustive-deps

  s.updateMeta({debounceCallback})

  const onDestroyedCallback = useCallback((...args) => { // eslint-disable-line react-hooks/rules-of-hooks
    if (!s.p.active) {
      return
    }

    if (s.p.debounce) {
      s.m.debounceCallback(...args)
    } else {
      s.p.onDestroyed(...args)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
    let connectDestroyed, onConnectedListener

    if (model) {
      connectDestroyed = ModelEvents.connectDestroyed(model, onDestroyedCallback)

      if (onConnected) {
        onConnectedListener = connectDestroyed.events.addListener("connected", onConnected)
      }
    }

    return () => {
      if (onConnectedListener) {
        connectDestroyed.events.removeListener("connected", onConnected)
      }

      if (connectDestroyed) {
        connectDestroyed.unsubscribe()
      }
    }
  }, [model?.id()])
}

export default apiMakerUseDestroyedEvent
