import {useCallback, useLayoutEffect, useMemo} from "react"
import useShape from "set-state-compare/src/use-shape"

const useResizeObserver = (element, callback) => {
  const s = useShape({callback})
  const onResize = useCallback((...args) => {
    s.p.callback(...args)
  }, [])
  const observer = useMemo(() => new ResizeObserver(onResize), [])

  useLayoutEffect(() => {
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.disconnect()
      }
    }
  }, [element])
}

export default useResizeObserver
