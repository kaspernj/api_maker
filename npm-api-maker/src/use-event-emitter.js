import useEnvSense from "env-sense/build/use-env-sense.js"
import {useEffect, useLayoutEffect, useMemo} from "react"

/**
 * @param {object} events
 * @param {string} event
 * @param {function} onCalled
 * @return {void}
 */
export default function ApiMakerUseEventEmitter(events, event, onCalled) {
  const {isServer} = useEnvSense()
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
