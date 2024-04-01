import {useCallback, useEffect} from "react"

const ApiMakerUseEventEmitter = (events, event, onCalled) => {
  const onCalledCallback = useCallback((...args) => {
    onCalled(...args)
  }, [events, event, onCalled])

  useEffect(() => {
    events.addListener(event, onCalledCallback)

    return () => {
      events.removeListener(event, onCalledCallback)
    }
  }, [events, event, onCalled])
}

export default ApiMakerUseEventEmitter
