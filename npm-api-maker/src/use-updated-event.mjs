import {useCallback, useEffect} from "react"
import debounceFunction from "debounce"
import ModelEvents from "./model-events.mjs"
import useShape from "set-state-compare/src/use-shape.js"

const ApiMakerUseUpdatedEvent = (model, onUpdated, {active = true, debounce, onConnected, ...restProps}) => {
  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to useUpdatedEvent: ${Object.keys(restProps).join(", ")}`)
  }

  const s = useShape({active, debounce, model})

  const debounceCallback = useCallback(() => {
    if (!s.meta.debounceInstance) {
      if (typeof s.p.debounce == "number") {
        s.meta.debounceInstance = debounceFunction(onUpdated, s.p.debounce)
      } else {
        s.meta.debounceInstance = debounceFunction(onUpdated)
      }
    }

    return s.m.debounceInstance
  }, [])

  const onUpdated = useCallback((...args) => {
    if (!s.p.active) {
      return
    }

    if (s.p.debounce) {
      debounceCallback()(...args)
    } else {
      onUpdated(...args)
    }
  }, [])

  useEffect(() => {
    let connectUpdated, onConnectedListener

    if (model) {
      connectUpdated = ModelEvents.connectUpdated(model, onUpdated)

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
  }, [model?.id(), onUpdated, onConnected])
}

export default ApiMakerUseUpdatedEvent
