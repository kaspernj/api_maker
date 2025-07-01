import useEnvSense from "env-sense/src/use-env-sense"
import {useCallback, useEffect, useLayoutEffect} from "react"

const ApiMakerUseEventListener = (target, event, onCalled) => {
  const {isServer} = useEnvSense()
  const useWorkingEffect = isServer ? useEffect : useLayoutEffect
  const onCalledCallback = useCallback((...args) => {
    onCalled.apply(null, args)
  }, [target, event, onCalled])

  useWorkingEffect(() => {
    if (target) {
      const eventListener = target.addEventListener(event, onCalledCallback)

      return () => {
        if (eventListener?.remove) eventListener.remove() // This is how its done in Expo + Jest.
        if (target.removeEventListener) target.removeEventListener(event, onCalledCallback) // This is the "old" way in browsers.
      }
    }
  }, [target, event, onCalled])
}

export default ApiMakerUseEventListener
