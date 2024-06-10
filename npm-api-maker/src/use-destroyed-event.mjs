import {useCallback, useEffect, useMemo} from "react"
import debounceFunction from "debounce"
import ModelEvents from "./model-events.mjs"
import useShape from "set-state-compare/src/use-shape.js"

const apiMakerUseDestroyedEvent = (model, onDestroyed, props) => {
  const {active = true, debounce, onConnected, ...restProps} = props || {}

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to useDestroyedEvent: ${Object.keys(restProps).join(", ")}`)
  }

  const s = useShape({active, debounce, model, onDestroyed})

  const debounceCallback = useMemo(() => {
    if (typeof debounce == "number") {
      return debounceFunction(s.p.onDestroyed, debounce)
    } else {
      return debounceFunction(s.p.onDestroyed)
    }
  }, [debounce])

  s.updateMeta({debounceCallback})

  const onDestroyedCallback = useCallback((...args) => {
    if (!s.p.active) {
      return
    }

    if (s.p.debounce) {
      s.m.debounceCallback(...args)
    } else {
      s.p.onDestroyed(...args)
    }
  }, [])

  useEffect(() => {
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
