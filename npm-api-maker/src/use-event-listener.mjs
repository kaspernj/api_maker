import {useCallback, useLayoutEffect} from "react"

const ApiMakerUseEventListener = (target, event, onCalled) => {
  const onCalledCallback = useCallback((...args) => {
    onCalled.apply(null, args)
  }, [target, event, onCalled])

  useLayoutEffect(() => {
    if (target) {
      target.addEventListener(event, onCalledCallback)

      return () => {
        target.removeEventListener(event, onCalledCallback)
      }
    }
  }, [target, event, onCalled])
}

export default ApiMakerUseEventListener
