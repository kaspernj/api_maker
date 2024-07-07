import {useLayoutEffect} from "react"

const ApiMakerUseEventEmitter = (events, event, onCalled) => {
  useLayoutEffect(() => {
    if (events) {
      events.addListener(event, onCalled)

      return () => {
        events.removeListener(event, onCalled)
      }
    }
  }, [events, event, onCalled])
}

export default ApiMakerUseEventEmitter
