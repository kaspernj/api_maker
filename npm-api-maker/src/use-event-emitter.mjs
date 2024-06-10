import {useEffect} from "react"

const ApiMakerUseEventEmitter = (events, event, onCalled) => {
  useEffect(() => {
    if (events) {
      events.addListener(event, onCalled)

      return () => {
        events.removeListener(event, onCalled)
      }
    }
  }, [events, event, onCalled])
}

export default ApiMakerUseEventEmitter
