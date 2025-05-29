import {useEffect, useLayoutEffect, useMemo} from "react"
import useSSR from "use-ssr"

const ApiMakerUseEventEmitter = (events, event, onCalled) => {
  const {isServer} = useSSR()
  const useWorkingEffect = isServer ? useEffect : useLayoutEffect

  // useMemo to instantly connect
  useMemo(() => {
    if (events) {
      events.addListener(event, onCalled)
    }
  }, [events, event, onCalled])

  // useLayoutEffect to disconnect when unmounted or changed
  useWorkingEffect(() => {
    if (events) {
      return () => {
        events.removeListener(event, onCalled)
      }
    }
  }, [events, event, onCalled])
}

export default ApiMakerUseEventEmitter
