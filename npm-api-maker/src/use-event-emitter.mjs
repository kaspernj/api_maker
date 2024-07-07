import {useMemo} from "react"

const ApiMakerUseEventEmitter = (events, event, onCalled) => {
  useMemo(() => {
    if (events) {
      events.addListener(event, onCalled)

      return () => {
        events.removeListener(event, onCalled)
      }
    }
  }, [events, event, onCalled])
}

export default ApiMakerUseEventEmitter
