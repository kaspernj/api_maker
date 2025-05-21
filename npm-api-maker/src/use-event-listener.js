import {useCallback, useEffect, useLayoutEffect} from "react"
import useSSR from "use-ssr"

const ApiMakerUseEventListener = (target, event, onCalled) => {
  const {isServer} = useSSR()
  const useWorkingEffect = isServer ? useEffect : useLayoutEffect

  const onCalledCallback = useCallback((...args) => {
    onCalled.apply(null, args)
  }, [target, event, onCalled])

  useWorkingEffect(() => {
    if (target) {
      const eventListener = target.addEventListener(event, onCalledCallback)

      return () => {
        if (eventListener) eventListener.remove() // This is how its done in Expo + Jest.
        if (target.removeEventListener) target.removeEventListener(event, onCalledCallback) // This is the "old" way in browsers.
      }
    }
  }, [target, event, onCalled])
}

export default ApiMakerUseEventListener
